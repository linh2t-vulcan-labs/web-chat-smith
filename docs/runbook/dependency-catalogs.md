# Dependency Catalogs — quy ước quản lý version thư viện trong monorepo

> Tài liệu tham chiếu chính thức cho hệ thống Bun workspace catalogs khai báo tại [`package.json`](../../package.json) (`workspaces.catalogs`). Mọi dependency dùng trong `apps/*` và `packages/*` phải khai báo version tại đây, **không** ghi version cứng trực tiếp trong package.json của từng app/package.

## 1. Nguyên tắc

- **Toàn bộ dependency (kể cả loại chỉ 1 app dùng) đều khai báo ở root**, để bump version chỉ cần sửa 1 chỗ (`package.json` gốc) thay vì lục từng `apps/*`, `packages/*`.
- Trong package.json của từng app/package, dependency luôn tham chiếu qua `"catalog:<tên-catalog>"`, không bao giờ ghi version literal (trừ các gói cực kỳ đặc thù chưa kịp phân loại — xem mục 4).
- Chỉ có **8 catalog**, chia theo **vai trò kỹ thuật của thư viện tại runtime/build-time**, không chia theo tên app hay tên domain nghiệp vụ. Đặt catalog theo tên app (ví dụ `super-app`) là anti-pattern — nó biến catalog thành một "junk drawer" của riêng app đó và làm mất tác dụng chia sẻ version.
- Khi thêm dependency mới: tra bảng ở mục 2, tìm rule khớp, thêm vào đúng catalog đó trong root `package.json`, rồi reference bằng `catalog:<tên>` trong package.json của app/package cần dùng.

## 2. Bảng 8 catalog

| Catalog | Rule để quyết định | Ví dụ hiện có |
| --- | --- | --- |
| `framework` | React/Next.js core và các type/adapter phải khớp chặt version với chúng | `react`, `react-dom`, `@types/react`, `@types/react-dom`, `next`, `@next/third-parties`, `next-intl`, `server-only`, `@swc/helpers` |
| `ui` | Component, style, tương tác hiển thị (kể cả animation/canvas/carousel) | `@base-ui/react`, `radix-ui`, `@radix-ui/*`, `tailwindcss`*, `shadcn`, `cva`, `clsx`, `cmdk`, `lucide-react`, `sonner`, `motion`, `lottie-react`, `konva`, `react-konva`, `swiper`, `qrcode.react`, `react-svg`, `@wrksz/themes` |
| `data` | State management & data-fetching | `@tanstack/react-query`(+`-devtools`, `-table`), `zustand`, `nuqs`, `immer` |
| `validation` | Schema, validate, decorator-based transform | `zod`, `class-transformer`, `reflect-metadata` |
| `content` | Markdown/CMS/xử lý tài liệu (parse, render, export) | `react-markdown`, `remark-gfm`, `marked`, `streamdown`(+`@streamdown/*`), `unist-util-visit`, `@types/unist`, `react-syntax-highlighter`, `html-to-docx`, `jszip`, `@sanity/image-url`, `next-sanity`, `@portabletext/react` |
| `integrations` | SDK/service bên thứ 3, auth & security token | `firebase`, `jose`, `jwt-decode`, `@paddle/paddle-js`, `@coralogix/browser`, `@marsidev/react-turnstile`, `ai` |
| `utils` | Helper runtime chung, không thuộc nhóm nào ở trên | `lodash-es`, `dayjs`, `uuid`, `axios`, `eventsource-parser`, `use-stick-to-bottom`, `react-infinite-scroll-hook`, `react-dropzone`, `react-joyride`, `@uidotdev/usehooks` |
| `tools` | Không bao giờ ship runtime — build/dev/test/lint/format only | `typescript`, `@types/node`, `@types/bun`, `lefthook`, `oxfmt`, `oxlint`(+plugin), `turbo`, `ultracite`, `vitest`, `tsdown`, `msw`, `webpack-bundle-analyzer`, `@svgr/webpack`, `postcss`, `sass` |

\* `tailwindcss`, `@tailwindcss/postcss`, `@tailwindcss/typography`, `tailwindcss-animate`, `tw-animate-css`, `tailwind-merge`, `tailwind-variants` đều nằm trong `ui` dù một phần chạy ở build-time — lý do là version của chúng luôn phải đi cùng bộ UI, tách riêng dễ gây lệch version với `tailwindcss` core.

## 3. Quy tắc phân loại nhanh khi thêm gói mới

Hỏi lần lượt theo thứ tự, dừng ở câu đầu tiên trả lời "có":

1. Gói không bao giờ có trong bundle client/server runtime, chỉ chạy lúc code, build, test, lint? → `tools`
2. Gói là react/next hoặc type ăn theo version react/next? → `framework`
3. Gói là schema/validate hoặc decorator-transform? → `validation`
4. Gói là state/data-fetching? → `data`
5. Gói xử lý markdown/CMS/document (đọc, parse, export file)? → `content`
6. Gói là SDK gọi ra dịch vụ bên ngoài (thanh toán, analytics, auth provider, AI provider)? → `integrations`
7. Gói hiển thị UI/animation/style? → `ui`
8. Còn lại, không thuộc nhóm nào ở trên → `utils`

## 4. Ngoại lệ

- Dependency dùng `workspace:*` (các package nội bộ `@cs/*`) không đi qua catalog — đây là liên kết trong monorepo, không phải version cần đồng bộ qua npm.
- Nếu một gói thực sự chỉ dùng tạm thời, thử nghiệm, sắp gỡ bỏ, có thể ghi version literal thay vì catalog — nhưng phải kèm comment/PR note giải thích, và dọn về catalog trước khi merge ổn định.
- **Transitive-only version pin qua `overrides`** (root `package.json`): khi một package không nằm trong `dependencies`/`devDependencies` của bất kỳ app/package nào (không ai import trực tiếp), nhưng cần ép version vì 2 dependency thật xung đột nhau (ví dụ `@swc/helpers`: `next` pin cứng `0.5.15`, còn `next-intl` → `@swc/core` peer-require `>=0.5.17`), version đó vẫn khai báo trong catalog phù hợp (theo vai trò kỹ thuật, không phải theo "ai dùng trực tiếp"), rồi `overrides` tham chiếu `"catalog:<tên>"` thay vì ghi version literal — giữ đúng nguyên tắc "1 chỗ duy nhất để bump version".

  ```json
  // root package.json
  "workspaces": { "catalogs": { "framework": { "@swc/helpers": "^0.5.17" } } },
  "overrides": { "@swc/helpers": "catalog:framework" }
  ```

## 5. Cách bump version

1. Sửa version tại đúng 1 dòng trong `workspaces.catalogs` ở root `package.json`.
2. Chạy `bun install` ở root — mọi package/app dùng `catalog:<tên>` đó tự động nhận version mới.
3. Chạy `bun run typecheck` (hoặc `turbo typecheck`) để phát hiện breaking change trước khi merge.
