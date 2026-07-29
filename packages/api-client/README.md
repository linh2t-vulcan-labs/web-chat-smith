# `@cs/api-client`

Lớp gọi API dùng chung cho mọi app Next.js trong monorepo. Đây là hướng dẫn thực dụng cho công việc hàng ngày — lý do thiết kế, trade-off, và bảng endpoint kế thừa nằm ở [`docs/runbook/api-client.md`](../../docs/runbook/api-client.md).

## 3 quy tắc bắt buộc

1. **Không tự gọi `fetch` cho backend chính.** Mọi endpoint đi qua 1 domain trong `src/services/*`. Raw `fetch`/`XMLHttpRequest` chỉ hợp lệ khi gọi tới host khác hoàn toàn (vd. `core/upload.ts` POST thẳng lên GCS).
2. **Không `throw` để báo lỗi HTTP.** Mọi hàm service trả `ApiResult<T> = [ApiError, null] | [null, T]` — luôn `const [error, data] = await xxx()`.
3. **Server và Client dùng 2 lớp gọi khác nhau**, không import chéo: Server Component/Action dùng `serverFetch()`; Client Component dùng `services/*` qua `useApiQuery`/`useApiMutation`. `./server/*` có `server-only`, lọt vào bundle client là build lỗi ngay.

## Gọi API trong Server Component / Server Action

```ts
import { serverFetch } from "@cs/api-client/server/server-fetch";
import { userManagement } from "@cs/api-client/services/user-management";

export default async function ProfilePage() {
  const [error, profile] = await serverFetch(userManagement.getProfile);
  if (error) return <ErrorState reason={error.reason} />;
  return <ProfileView profile={profile} />;
}
```

Không gọi `userManagement.getProfile()` trực tiếp ở server — nó dùng `TokenManager`, thứ chỉ tồn tại trong trình duyệt. `serverFetch(endpoint, input?)` đọc cookie qua `next/headers` thay vì `TokenManager`, nhưng dùng chung 1 object endpoint với client nên không có 2 nguồn spec để lệch nhau.

Bảo vệ layout cần đăng nhập: `await requireAuthenticatedSession()` từ `@cs/api-client/server/guard` (redirect `/login` nếu thiếu cookie).

## Gọi API trong Client Component

```tsx
"use client";
import { useApiMutation } from "@cs/api-client/hooks/use-api-mutation";
import { useApiQuery } from "@cs/api-client/hooks/use-api-query";
import { userManagement } from "@cs/api-client/services/user-management";
import { useTranslations } from "next-intl";

function ProfileCard() {
  const t = useTranslations("ApiErrors");
  const { data, error, isLoading } = useApiQuery({
    queryKey: ["profile"],
    queryFn: ({ signal }) => userManagement.getProfile(undefined, { signal }), // luôn forward {signal}
  });

  const updateInfo = useApiMutation({
    mutationFn: (input: { username: string }) =>
      userManagement.updateUserInfo(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });

  if (error)
    return (
      <ErrorBanner
        message={t.has(error.reason) ? t(error.reason) : t("UNKNOWN")}
      />
    );
  if (isLoading) return <Spinner />;
  return <ProfileView profile={data} onSave={(u) => updateInfo.mutate(u)} />;
}
```

- **Bắt buộc** forward `{ signal }` trong `queryFn` — bỏ qua thì request cũ vẫn chạy ngầm sau unmount/refetch.
- **Mutation không tự invalidate cache** — luôn gọi `queryClient.invalidateQueries()`/`setQueryData()` trong `onSuccess`.
- Đăng nhập/session: mount `<ApiAuthProvider>` 1 lần ở app root, dùng `useApiAuth()` (`isAuthenticated`, `accessToken`, `logout`) bên dưới — cả 2 export từ `@cs/api-client/providers/auth-provider`.

### Prefetch từ Server Component — chỉ khi cần

Nếu endpoint có `auth: "required"` → **luôn `useApiQuery` client-only, không prefetch**. Prefetch (`prefetchServerQuery()` + `HydrationBoundary`) chỉ dùng cho endpoint `auth: "none"` khi cần tránh waterfall lần load đầu. Chi tiết đầy đủ (bao gồm 2 bug thật đã verify với Cache Components: refresh-storm và `Date.now()` bailout) xem runbook mục "Data fetching pattern".

## Các trường hợp đặc biệt

| Nhu cầu | Dùng gì |
| --- | --- |
| Upload file | `uploadFile()` từ `@cs/api-client/core/upload` — tự lo 2 bước (signed policy + POST thẳng GCS), báo `onProgress` |
| Tác vụ chạy lâu, backend trả `process_id` rồi phải poll | `useProcess({ transport: "poll", fetchStatus, ... })` từ `@cs/api-client/hooks/use-process` |
| Tác vụ có SSE thật (vd. design-studio) | `useProcess({ transport: "sse", ... })`, hoặc gọi thẳng `openMessageStream()`/`subscribeSse()` khi 1 stream có nhiều event type khác payload |
| Cần tiếp tục theo dõi job sau khi đóng tab/reload | Truyền `persistKey` vào `useProcess()`, đọc lại bằng `loadPendingProcess(persistKey)` lúc mount |
| Backend chưa mở CORS / muốn giấu topology | Đặt `transport: "proxy"` trong config endpoint — code gọi nơi khác không đổi |

Mất mạng giữa lúc poll/SSE: tự pause khi offline, tự resume khi có mạng lại — không cần code gì thêm.

## Thêm 1 domain/endpoint mới

1. Tạo `src/services/ten-domain/ten-domain.ts` + `index.ts` (`export { tenDomain } from "./ten-domain";`) — domain luôn là 1 thư mục, kể cả domain 1 endpoint.
2. Schema response bằng `zod/mini`, không dùng class-transformer/DTO class.
3. `defineService("service-segment").endpoint(...)` — copy đúng `method`/`path` từ backend, không đoán khi chưa xác nhận. `path` không gồm tiền tố `/api/{version}`.
4. ≥ 2 sub-domain không liên quan trực tiếp → tách file theo sub-domain (mẫu `conversation/`, `design-studio/`), `index.ts` chỉ lắp ráp.
5. Response bọc trong 1 key envelope (`{project: {...}}`) → `unwrapEnvelope(key, schema)` từ `utils/envelope`, đừng tự viết transform riêng.
6. Field dùng chung nhiều domain → thêm vào `services/shared/common.ts`.
7. Reason lỗi mới → 1 dòng vào `errors/reasons.ts` **và** 1 key vào namespace `ApiErrors` của mọi file `messages/{locale}.json`.
8. Endpoint không idempotent → `retry: false`.
9. `bun x ultracite fix` + `tsc --noEmit` sạch trước khi commit.

## Checklist trước khi merge

- [ ] Không có `fetch`/`axios`/`XMLHttpRequest` viết tay ngoài `core/*`.
- [ ] Không `throw` để báo lỗi nghiệp vụ — dùng tuple `[error, data]`.
- [ ] Domain mới là 1 thư mục có `index.ts`.
- [ ] Mọi `queryFn` forward `{ signal }`; mọi mutation có `onSuccess` invalidate đúng query.
- [ ] Endpoint không idempotent có `retry: false`.
- [ ] Không import `@cs/api-client/server/*` trong file `"use client"`.
- [ ] Reason lỗi mới có mặt ở cả `reasons.ts` và `ApiErrors` của mọi locale.
- [ ] Endpoint `auth: "required"` không bị prefetch ở Server Component.

Chi tiết đầy đủ (kiến trúc, token lifecycle, trade-off direct-vs-proxy, danh mục endpoint kế thừa) ở [`docs/runbook/api-client.md`](../../docs/runbook/api-client.md).
