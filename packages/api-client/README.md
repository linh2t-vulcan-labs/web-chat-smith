# `@cs/api-client`

Lớp giao tiếp API dùng chung cho mọi app Next.js trong monorepo. Hướng dẫn thực dụng để dùng đúng và biết đặt file mới vào đâu — lý do kiến trúc đầy đủ, bảng endpoint kế thừa nằm ở [`docs/runbook/api-client.md`](../../docs/runbook/api-client.md).

## Nguyên tắc cốt lõi

1. **Không gọi `fetch` trực tiếp trong app code.** Mọi endpoint đi qua 1 domain trong `src/services/*`.
2. **Không throw để báo lỗi HTTP.** Mọi hàm service trả về `ApiResult<T> = [ApiError, null] | [null, T]` — luôn `const [error, data] = await xxx()` và kiểm tra `error` trước.
3. **Server và Client dùng 2 lớp gọi khác nhau, không trộn lẫn** (mục 2/3). Đây là giới hạn thật của Next.js: Server Component không dùng được `TokenManager` (chỉ tồn tại trong trình duyệt), và code client không được import từ `./server/*` (dùng `server-only`, build lỗi nếu lọt vào bundle client).

---

## 1. Cấu trúc thư mục

```
src/
  core/         transport thuần: fetch wrapper, retry, SSE, token refresh, upload
  endpoints/    registry.ts (defineService/.endpoint) + types.ts — khung mọi domain dùng chung
  errors/       ApiError + bảng reason -> {httpStatus, retryable, i18nKey}
  utils/        helper thuần: build URL, camelCase<->snake_case, JWT decode, envelope unwrap, parse response
  hooks/        useApiQuery / useApiMutation / useProcess — dùng ở Client Component
  providers/    ApiAuthProvider/useApiAuth, QueryClientProvider — mount 1 lần ở app root
  server/       server-fetch/cookies/guard — CHỈ dùng trong Server Component/Action ("server-only")
  proxy/        route handler BFF dùng chung cho endpoint transport:"proxy"
  types/        type dùng chung toàn package (AuthMode, QueryParams, JsonValue...)
  services/     1 thư mục cho mỗi domain backend — quy ước bên dưới
```

**Mọi domain trong `services/` là 1 thư mục có `index.ts`**, không ngoại lệ kể cả domain 1 endpoint (cùng quy ước `packages/ui/src/components/*`):

```
services/
  user-management/
    user-management.ts   ← schema + defineService(...).endpoint(...) của domain
    index.ts              ← export { userManagement } from "./user-management";
  shared/
    common.ts              ← schema/enum dùng chung nhiều domain, không phải 1 domain riêng
```

Domain gộp nhiều sub-domain không liên quan (`conversation`, `design-studio`) tách theo sub-domain, `index.ts` chỉ còn là bảng lắp ráp:

```
services/conversation/
  crud.ts / messages.ts / images.ts / citations.ts / models.ts / custom-response.ts
  index.ts   import các *Config từ các file trên, gọi .endpoint(name, config) — không định nghĩa schema mới ở đây
```

Mỗi file con export hằng số `EndpointConfig<Input, Response>` (thuần data, không gọi `defineService`) vì `.endpoint()` là 1 chuỗi fluent build trên cùng 1 object, không "nối" được giữa nhiều file — `index.ts` mới thật sự gọi `defineService(...).endpoint(name, config)...`, người dùng vẫn gọi đúng 1 object `conversation.xxx()` như bình thường.

**Chọn 1 file phẳng hay tách sub-domain?** 1 nhóm endpoint cùng mối quan tâm (`payment`, `product`) → giữ file phẳng `<domain>/<domain>.ts`. Gộp ≥ 2 sub-domain không liên quan trực tiếp → tách ngay, đừng đợi file phình to.

**Không có barrel file gộp nhiều domain** (không có `services/index.ts` re-export tất cả) — import đúng domain cần dùng:

```ts
import { userManagement } from "@cs/api-client/services/user-management";
import { conversation } from "@cs/api-client/services/conversation";
```

---

## 2. Server Component / Server Action

| Endpoint có `auth` | Cách gọi |
| --- | --- |
| `"required"` (đa số) | `serverFetch()` từ `@cs/api-client/server/server-fetch` |
| `"none"` (vd. `refreshToken`) | Gọi thẳng object trong `services/*` cũng được |

```ts
// app/[locale]/profile/page.tsx (Server Component)
import { serverFetch } from "@cs/api-client/server/server-fetch";
import { userManagement } from "@cs/api-client/services/user-management";

export default async function ProfilePage() {
  const [error, profile] = await serverFetch(userManagement.getProfile);

  if (error) return <ErrorState reason={error.reason} />;
  return <ProfileView profile={profile} />;
}
```

Không gọi `userManagement.getProfile()` **trực tiếp** ở đây vì nó dùng `getTokenManager()` — hàm **cố tình throw** ngoài trình duyệt. `serverFetch(endpoint, input?)` là "bản song song" đọc `access_token`/`refresh_token` từ cookie qua `next/headers` thay vì `TokenManager`, nhưng nhận thẳng cùng object endpoint bạn vẫn dùng ở client (`userManagement.getProfile`) — nó đọc `method`/`path`/`version`/`responseSchema` từ `.config` gắn sẵn trên object đó (xem `endpoints/registry.ts`), không phải 1 bản khai báo song song. **Không còn "2 nơi có thể trôi nếu quên đồng bộ"**: thêm field/param cho endpoint trong `services/*` thì `serverFetch()` tự động thấy field mới đó, không cần sửa gì ở call site.

Endpoint cần input: `serverFetch(userManagement.updateUserInfo, { username: "..." })`.

Bảo vệ 1 layout cần đăng nhập:

```ts
import { requireAuthenticatedSession } from "@cs/api-client/server/guard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthenticatedSession(); // redirect "/login" nếu không có refresh_token cookie
  return children;
}
```

**Server Action**: giống hệt trên — `serverFetch()` với method tương ứng, đặt `"use server"` ở đầu file.

---

## 3. Client Component

Luôn qua `services/*` + `useApiQuery`/`useApiMutation` (không gọi thẳng object service ngoài hook, trừ side-effect thuần không cần cache — và ngay cả side-effect đó, nếu UI có phụ thuộc vào lúc nào request xong (disable nút, hiện spinner), vẫn nên qua `useApiMutation` để có `isPending` free, đừng tự bịa `useState` riêng).

**Loading state**: package không có state riêng cho "loading" ngoài những gì `useApiQuery`/`useApiMutation` (`isLoading`/`isPending`, từ TanStack Query) đã cho — đây là chủ đích, không phải thiếu sót. Ở Server Component, loading state là việc của Next.js (`loading.tsx`/`<Suspense>`), không phải của package này (mục 2, `await serverFetch()` chỉ đơn giản là block render).

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
    // LUÔN forward {signal} để TanStack Query hủy được request thật khi unmount/refetch.
    queryFn: ({ signal }) => userManagement.getProfile(undefined, { signal }),
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

- **Bắt buộc** forward `{ signal }` — bỏ qua thì request cũ vẫn chạy ngầm sau khi unmount/query key đổi.
- **Mutation không tự invalidate cache** — luôn gọi `queryClient.invalidateQueries()`/`setQueryData()` trong `onSuccess`.

**Xác thực**: mount `ApiAuthProvider` 1 lần ở app root, dùng `useApiAuth()` bên dưới:

```tsx
import {
  ApiAuthProvider,
  useApiAuth,
} from "@cs/api-client/providers/auth-provider";

<ApiAuthProvider>{children}</ApiAuthProvider>;
const { isAuthenticated, accessToken, logout } = useApiAuth();
```

Đăng nhập/refresh dùng 3 Route Handler có sẵn (`/api/auth/session`, `/refresh`, `/logout`) — xem `apps/web/app/api/auth/*`, không tự implement lại.

**Prefetch từ Server Component** (tránh waterfall):

```tsx
import { getQueryClient } from "@cs/api-client/providers/query-client-provider";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

export default async function Page() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery({
    queryKey: ["profile"],
    queryFn: () => serverFetch(userManagement.getProfile),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileCard />
    </HydrationBoundary>
  );
}
```

> ⚠️ Chỉ dùng để prefetch/bàn giao — đừng render trực tiếp kết quả này ở Server Component rồi để Client Component `useQuery` cùng key sau đó, 2 bên sẽ tranh "chủ sở hữu" cache. Luôn qua `HydrationBoundary`.

---

## 4. Các trường hợp đặc biệt

| Nhu cầu | Dùng gì |
| --- | --- |
| Upload file | `uploadFile()` từ `@cs/api-client/core/upload` — tự lo 2 bước (signed policy + POST thẳng GCS), báo `onProgress` |
| Tác vụ chạy lâu, backend trả `process_id` rồi phải poll | `useProcess({transport: "poll", fetchStatus, ...})` từ `@cs/api-client/hooks/use-process` |
| Tác vụ có SSE thật (vd. `design-studio` tạo logo) | `useProcess({transport: "sse", sseUrl, sseEventNames, ...})`, hoặc gọi thẳng `openMessageStream()`/`subscribeSse()` khi nhiều event type khác payload (xem `services/design-studio/stream.ts`) |
| Backend chưa mở CORS / muốn giấu topology / rate-limit tập trung | Đặt `transport: "proxy"` trong config endpoint — code gọi nơi khác không đổi |

**Mất mạng / mất kết nối giữa lúc đang chạy tác vụ dài**: cả `poll` (`core/polling.ts`) và `sse` (`core/sse.ts`) tự pause khi offline, tự resume ngay khi có `online` event trở lại — không cần code gì thêm ở call site. SSE còn tự **reconnect** (giữ nguyên cursor qua `Last-Event-ID`) khi stream bị đứt giữa chừng mà chưa nhận được terminal event (network chập, proxy/load-balancer timeout) — mặc định `reconnect: true`, đặt `reconnect: false` nếu muốn tự xử lý UI retry.

**"Đóng laptop/tắt tab giữa lúc đang chạy, mở lại sau vẫn thấy tiếp tục"**: job luôn chạy trên backend (`process_id`), không phụ thuộc client còn mở hay không — cái thiếu là client phải **tự nhớ** `processId` nào đang chờ để hỏi lại. Truyền `persistKey` (ví dụ `conversation:${conversationId}`) vào `useProcess()` để nó tự lưu `processId` đang pending vào `localStorage`; khi trang mount lại (F5, đóng rồi mở lại tab), đọc lại bằng `loadPendingProcess(persistKey)` từ `@cs/api-client/hooks/use-process` để biết cần `useProcess(pending.processId, ...)` với `processId` nào, không phải chờ user tạo lại request từ đầu:

```ts
import {
  loadPendingProcess,
  useProcess,
} from "@cs/api-client/hooks/use-process";

const persistKey = `conversation:${conversationId}`;
const [processId, setProcessId] = useState(
  () => loadPendingProcess(persistKey)?.processId
);

const { data, status } = useProcess(processId, {
  transport: "poll",
  fetchStatus: (id, signal) =>
    conversation.getProcess({ processId: id }, { signal }),
  persistKey,
});
```

```ts
export const adminForceLogoutConfig: EndpointConfig<void, unknown> = {
  method: "POST",
  path: "/admin/force-logout",
  auth: "required",
  transport: "proxy", // <- chỉ cần thêm dòng này
};
```

Yêu cầu app đã mount `app/api/proxy/[...path]/route.ts`:

```ts
import { createProxyRouteHandler } from "@cs/api-client/proxy/route-handler";
export const { GET, POST, PUT, PATCH, DELETE } = createProxyRouteHandler();
```

---

## 5. Thêm 1 domain/endpoint mới

1. Tạo `src/services/ten-domain/ten-domain.ts` + `index.ts` (`export { tenDomain } from "./ten-domain";`) — luôn là thư mục (mục 1).
2. Schema response bằng `zod/mini`, không dùng class-transformer/DTO class.
3. `defineService("ten-service-segment").endpoint(...)` cho từng route — copy đúng `method`/`path` từ backend, không đoán nếu chưa xác nhận.
4. ≥ 2 sub-domain rõ rệt → tách ngay theo mẫu `conversation/`/`design-studio/` (mục 1).
5. Response bọc trong 1 key envelope (`{project: {...}}`, `{data: {...}}`) → `unwrapEnvelope(key, schema)` từ `@cs/api-client/utils/envelope`, đừng tự viết `z.pipe`/`transform` riêng.
6. Field dùng chung nhiều domain → thêm vào `services/shared/common.ts`, đừng khai báo lại.
7. Header riêng cho domain (vd. `X-Application-Id`) → khai báo `headers` tại endpoint đó, không thêm cờ vào core.
8. Reason lỗi mới → thêm đúng 1 dòng vào `errors/reasons.ts` **và** 1 key vào namespace `ApiErrors` của cả 3 file `messages/{en,ar,zh-Hans}.json`.
9. Endpoint không idempotent → `retry: false`; tạo dữ liệu tài chính/đơn hàng → thêm `idempotent: true`. Đừng đặt `retry: false` cho thao tác vốn idempotent (rename, toggle) chỉ để giống file khác.
10. Cần gọi từ Server Component `auth: "required"` → `serverFetch(theService.theEndpoint, input?)` (mục 2) — không cần viết hàm riêng, không cần khai báo lại `method`/`path`/`version`/`responseSchema`.
11. `bun x ultracite fix` + `tsc --noEmit` sạch trước khi commit.

---

## 6. Checklist trước khi merge

- [ ] Không có `fetch`/`axios`/`XMLHttpRequest` viết tay ngoài `core/*`.
- [ ] Không `throw` để báo lỗi nghiệp vụ — dùng tuple `[error, data]`.
- [ ] Domain mới là 1 thư mục có `index.ts`, không phải file `.ts` phẳng trong `services/`.
- [ ] Mọi `queryFn` nhận và forward `{ signal }`.
- [ ] Mọi mutation có `onSuccess` invalidate/update đúng query.
- [ ] Endpoint không idempotent có `retry: false`.
- [ ] Không import `@cs/api-client/server/*` trong file `"use client"`.
- [ ] Reason lỗi mới có mặt ở cả `reasons.ts` và `ApiErrors` của mọi locale.
- [ ] Gọi từ Server Component qua `serverFetch(endpoint, input?)` (mục 2) — không viết `httpRequest`/URL tay, không có config song song nào để lệch.
- [ ] Tác vụ dài (poll/SSE) có UI cần resume sau reload/đóng tab → có `persistKey` ở `useProcess()`.

---

Chi tiết đầy đủ (lý do kiến trúc, trade-off direct-vs-proxy, cơ chế refresh token/cross-tab, danh mục endpoint kế thừa) ở [`docs/runbook/api-client.md`](../../docs/runbook/api-client.md).
