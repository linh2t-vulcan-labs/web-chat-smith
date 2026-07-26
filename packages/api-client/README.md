# `@cs/api-client`

Lớp giao tiếp API dùng chung cho mọi app Next.js trong monorepo. Hướng dẫn thực dụng để dùng đúng và biết đặt file mới vào đâu — lý do kiến trúc đầy đủ, bảng endpoint kế thừa nằm ở [`docs/runbook/api-client.md`](../../docs/runbook/api-client.md).

## Nguyên tắc cốt lõi

1. **Không gọi `fetch` trực tiếp trong app code cho backend chính** (`CS_PUBLIC_API_BASE_URL`). Mọi endpoint đi qua 1 domain trong `src/services/*` — `core/http-client.ts`'s `httpRequest()` là nơi DUY NHẤT trong cả package gọi `fetch()` thật, mọi service call (client qua `authenticatedRequest`, server qua `serverFetch`) đều đi qua đó, nên auth header/retry/case-convert/error-normalize chỉ cần đúng 1 lần, không drift. Raw HTTP ngoài service layer chỉ hợp lệ khi gọi tới 1 host/service **khác hoàn toàn** backend chính (ví dụ: `core/upload.ts`'s `uploadFile()` POST thẳng lên GCS bằng `XMLHttpRequest` cho leg upload — GCS không phải backend chính) — đặt trong `core/*`, ghi rõ lý do, không rải trong component/route.
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

Đăng nhập/refresh dùng 3 Route Handler có sẵn — xem `apps/web/app/api/auth/*`, không tự implement lại:

- `POST /api/auth/session` — exchange Firebase ID token lấy session Vulcan (sign-in).
- `GET /api/auth/session` — gọi đúng 1 lần/tab bởi `TokenManager.restoreSessionOnce()` lúc cold load. Cache-first: đọc cookie `access_token` mirror trước (`ensureServerAccessToken()`), chỉ rotate refresh token thật khi cookie đó thiếu/hết hạn — reload với access token còn hạn không tốn request rotate nào.
- `POST /api/auth/refresh` — luôn ép rotate thật. Chỉ dùng bởi proactive timer và reactive 401 handling (2 nơi _cần_ rotate mỗi lần gọi) — `restoreSessionOnce()` không gọi route này.
- `POST /api/auth/logout`.

### Chọn pattern fetch nào?

**Đọc mục này trước khi thêm 1 data-fetching mới** — trả lời tuần tự, dừng ở câu đầu tiên áp dụng được:

1. **Là write/mutate (POST tạo/sửa/xoá)?** → `useApiMutation` (mục 3). Không "prefetch" 1 mutation.
2. **Việc chạy lâu, có `process_id`/SSE?** → `useProcess`/`openMessageStream` (mục 4), không phải pattern dưới đây.
3. **Endpoint có `auth: "required"`?**
   - **Có** → **luôn `useApiQuery` client-only, không prefetch ở Server Component.** Đây không phải "tạm chấp nhận cho đơn giản" — là kết luận sau khi đã thử prefetch+`HydrationBoundary` thật và đo được rủi ro cụ thể (xem cảnh báo 🛑 bên dưới). `prefetchServerQuery()` (bên dưới) tự throw nếu bạn gọi nhầm endpoint loại này — nếu code refuse chạy, đây chính là lý do, đừng tìm cách bypass.
   - **Không** (`auth: "none"`, dữ liệu public) → tiếp câu 4.
4. **Dữ liệu giống nhau cho MỌI user, tương đối ổn định (không đổi theo cookie/session)?**
   - **Có** → cân nhắc `"use cache"` của Next trước (cache CHÉO request thật — TanStack `QueryClient` phía server là instance mới mỗi request, **không** cache chéo request được, xem cảnh báo ⚠️ thứ 2 bên dưới). Dùng prefetch dưới đây khi cần tránh waterfall cho lần load đầu VÀ vẫn muốn client tiếp quản qua `useApiQuery`. Ví dụ đầy đủ đã áp dụng: `apps/web/app/[locale]/design-studio-templates/page.tsx` (`designStudio.listTemplates`, `auth: "none"`) — verify trực tiếp: 4 lần vào lại trang (kể cả back/forward) chỉ **1 lần** gọi thật tới backend, thay vì 1 lần/mỗi lượt vào trang như khi dùng `prefetchServerQuery()` cho endpoint này.
   - **Không** (theo tham số/route nhưng vẫn public) → dùng `prefetchServerQuery()` + `HydrationBoundary` bên dưới.
5. **Component/section này nằm trong 1 segment dễ bị remount vì lý do KHÔNG liên quan** (ví dụ dưới `[locale]/layout.tsx` — đổi ngôn ngữ remount toàn bộ, xem `apps/web/app/layout.tsx`'s comment)? Nếu có, chi phí prefetch bị trả **mỗi lần remount đó**, không chỉ mỗi lần user thực sự vào trang — thiên hẳn về client-only trừ khi có lý do SEO/first-paint rất rõ ràng cho đúng phần dữ liệu này.

**Prefetch từ Server Component** (tránh request waterfall — xem [request-waterfalls](https://tanstack.com/query/latest/docs/framework/react/guides/request-waterfalls), [prefetching](https://tanstack.com/query/latest/docs/framework/react/guides/prefetching), [ssr](https://tanstack.com/query/latest/docs/framework/react/guides/ssr), [advanced-ssr](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr) — chỉ dùng khi bước 3 ở trên trả lời "Không"):

```tsx
// page.tsx — Server Component, KHÔNG render data, chỉ prefetch + bàn giao
import { getQueryClient } from "@cs/api-client/core/query-client";
import { prefetchServerQuery } from "@cs/api-client/server/prefetch";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

export default async function Page() {
  const queryClient = getQueryClient();
  // Throws nếu productCatalog.getFeatured có auth: "required" — xem mục 3 ở trên.
  await prefetchServerQuery({
    endpoint: productCatalog.getFeatured,
    queryClient,
    queryKey: ["product-catalog", "featured"],
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FeaturedProducts />{" "}
      {/* Client Component, useApiQuery({ queryKey: ["product-catalog", "featured"], ... }) */}
    </HydrationBoundary>
  );
}
```

- **Luôn dùng `prefetchServerQuery()` (`@cs/api-client/server/prefetch`), không tự viết `queryClient.prefetchQuery()` tay** — nó gói đúng cách unwrap `ApiResult`/throw-on-error, VÀ tự chặn (throw) nếu endpoint là `auth: "required"` trước khi kịp gây ra vấn đề ở mục 🛑 dưới đây. Không có tham số nào để bypass check này — nếu bạn chắc chắn trường hợp của mình là ngoại lệ thật, điều đó cần qua review của người khác, không phải 1 flag boolean tự bật.
- **`queryKey` phải giống 100%** giữa `prefetchServerQuery` và `useQuery` phía client — khác key thì hydrate vào chỗ khác, client vẫn tự fetch lại.
- **Component render (Client Component) là nguồn render DUY NHẤT.** [Advanced SSR guide](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr) cảnh báo rõ: đừng render trực tiếp kết quả fetch ở Server Component rồi để Client Component `useQuery` cùng key sau đó — 2 bên dễ lệch nhau khi client refetch (qua `staleTime`, hoặc 1 transition chỉ xảy ra ở client mà server chưa thấy). Server chỉ prefetch, không quyết định UI.
- **`staleTime` phải > 0** (đã set `60_000` mặc định ở `core/query-client.ts`) — theo [prefetching guide](https://tanstack.com/query/latest/docs/framework/react/guides/prefetching): "If you are prefetching on the server, set a default `staleTime` higher than `0`", nếu không client coi data hydrate là stale ngay và fetch lại lập tức.

> ⚠️ Import `getQueryClient` từ `core/query-client`, không phải `providers/query-client-provider` — file đó có `"use client"` (cho `ApiQueryProvider`'s JSX), nên toàn bộ module bị RSC coi là client reference; gọi `getQueryClient()` từ Server Component qua đường đó sẽ lỗi build "Attempted to call getQueryClient() from the server but getQueryClient is on the client."

> ⚠️ Prefetch chạy lại mỗi request nếu data phụ thuộc cookie/session — mỗi request Server tạo `QueryClient` mới (`core/query-client.ts`, không phải singleton phía server), không có cache nào xuyên request để tái dùng. Đây là đúng/không tránh được (data theo user/session, không thể cache chung), không phải bug — chỉ Client Component (`useApiQuery`, `staleTime`) mới dedupe được giữa các lần re-render/remount trong CÙNG 1 lần tải trang. Nếu data KHÔNG theo user/session (public, giống mọi người), xem `"use cache"` của Next thay vì ép TanStack Query làm việc nó không làm được ở server (mục 4 ở trên).

> 🛑 **Cache Components (`cacheComponents: true`, xem `next.config.ts`) + prefetch có side effect (auth `required` → token refresh) = rủi ro thật, đã confirm bằng test trực tiếp (không phải giả thuyết).** TanStack Query tự gọi `Date.now()` nội bộ mỗi khi 1 query settle (stamp `dataUpdatedAt`) — dưới Cache Components, giá trị "unstable" này trigger `NEXT_PRERENDER_INTERRUPTED` ("Route needs to bail out of prerendering") khiến Next **speculative re-invoke lại Server Component đó thêm lần nữa** trước khi chốt render thật. Với 1 query gọi `serverFetch()` tới endpoint `auth: "required"` mà access token đã hết hạn, MỖI lần re-invoke đó là **1 lần refresh-token rotation thật với backend** — verify trực tiếp: 1 page load ra **3 lần gọi refresh thật** (2 lần từ các lượt server speculative-render + 1 lần từ client tự restore độc lập), dù về logic chỉ cần đúng 1 lần. Backend không có grace period cho rotation (xem `core/token-manager.ts`) nên đây không chỉ là lãng phí — có thể thật sự làm hỏng phiên nếu 1 trong các lần rotate đó thua race.
>
> Đây là lý do `prefetchServerQuery()` tồn tại thay vì chỉ dừng ở cảnh báo trong docs — 1 dòng docs dễ bị bỏ qua 2 năm và 10 người sau; 1 lỗi throw đúng tại chỗ gọi thì không. Ví dụ thực tế đã áp dụng: `apps/web/components/auth/auth-status.tsx` (`AuthStatus`) — cố ý client-only, không prefetch, lý do ghi trong doc comment của file.

> 🛑 **Bug tương tự, nguồn khác: `queryClient.setQueryData()` cũng stamp `Date.now()` — không chỉ `prefetchQuery()`.** Dùng `"use cache"` (mục 4 ở trên) rồi nạp kết quả bằng `queryClient.setQueryData(queryKey, data)` (thay vì `prefetchQuery`) **không** tránh được bug — verify trực tiếp trên `apps/web/app/[locale]/design-studio-templates/page.tsx`: Next vẫn throw `"encountered the unstable value Date.now() while prerendering"` ngay tại dòng `setQueryData`, vì Cache Components cố prerender static shell cho MỌI route không có dynamic marker tường minh, bất kể data đến từ `"use cache"` hay fetch thường. Không phải lỗi của `"use cache"` — TanStack luôn stamp `dataUpdatedAt` bất kể nguồn data từ đâu.
>
> **Fix**: bọc phần code đụng tới `QueryClient` (dù là `prefetchQuery` hay `setQueryData`) trong 1 component gọi `await connection()` (từ `next/server`) trước, rồi đặt component đó sau 1 `<Suspense>` boundary — đây là cách Next chính thức khuyến nghị để opt 1 subtree ra khỏi prerender tĩnh và trì hoãn tới lúc request thật (xem "Random values and timestamps" trong Next's caching guide). Phần shell còn lại của trang (title, layout tĩnh) vẫn prerender bình thường, chỉ phần hydrate TanStack Query mới trở thành 1 "dynamic hole" streamed sau `Suspense` fallback. Ví dụ đầy đủ: `TemplatesHydrator` trong `apps/web/app/[locale]/design-studio-templates/page.tsx`.

**Trước khi tin lý thuyết — verify bằng browser thật.** Tài liệu TanStack Query/Next.js không cover hết mọi tương tác thực tế giữa 2 hệ thống (2 phát hiện ở trên — refresh-storm và `Date.now()` bailout — đều ra từ test trực tiếp, không phải đọc docs mà biết trước). Với bất kỳ pattern fetch mới nào có khả năng chạy lại nhiều lần ngoài dự kiến (prefetch server-side, hoặc bất kỳ thứ nằm trong 1 segment dễ remount — mục 5 ở trên), verify tối thiểu 2 kịch bản trước khi merge: cold load (đếm số request thật tới backend), và 1 hành động gây remount không liên quan tới data đó (đổi ngôn ngữ/theme, hoặc bất kỳ provider ở tầng cao dễ remount) — đếm lại, phải ra đúng số dự kiến.

**Chưa dùng — cần verify trước khi cân nhắc:**

- **Dehydrate query đang pending (TanStack ≥ 5.40, streaming)**: [advanced-ssr](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr) cho phép `prefetchQuery` KHÔNG `await` — query settle phía client, promise stream qua RSC payload, `useSuspenseQuery` "nhận" lại promise đó. Về lý thuyết tránh được bug 🛑 ở trên (settle không xảy ra trong lút server prerender nên không chắc còn trigger `Date.now()` bailout) — nhưng đây vẫn là suy đoán, chưa test trực tiếp với `cacheComponents: true` của app này. Đừng áp dụng cho tới khi đã đo lại 2 kịch bản ở trên với pattern này.
- **`@tanstack/react-query-next-experimental`** (`useSuspenseQuery` thẳng trong Client Component lúc SSR, không cần prefetch tay): TanStack docs tự nhận package này tái tạo lại waterfall lúc client-side navigation (khác với prefetch, vốn flatten waterfall cả lần load đầu lẫn lúc navigate). App này đã chọn model server-shell + streaming qua Cache Components/PPR — không dùng package này, không cần cân nhắc trừ khi bỏ hẳn Cache Components.
- **Nhiều Server Component con cùng cần prefetch** (chưa có instance nào trong app): đừng `await` tuần tự từng cái (tạo waterfall phía server) — dùng `Promise.all`/parallel routes. Chưa cần thiết lập concrete pattern vì chưa có domain nào cần > 1 Server Component prefetch trên cùng 1 page.

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
