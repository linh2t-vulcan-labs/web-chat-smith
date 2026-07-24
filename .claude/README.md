# Claude Code setup cho repo này — Skills & Agents

Runbook này giải thích **có gì**, **dùng thế nào**, và **cách thêm/sửa/xoá** khi cần — để không phải nhớ lại từ đầu sau vài tháng không đụng tới.

## 1. Skill vs Agent — khác nhau ở đâu

- **Skill** (`.claude/skills/<tên>/SKILL.md`) = 1 **quy trình/checklist** mà tôi (Claude) tự làm theo ngay trong lượt trả lời hiện tại, không tách context. Dùng cho quy trình bạn muốn tôi luôn tuân theo (viết code, review, refactor).
- **Agent** (`.claude/agents/<tên>.md`) = 1 **subagent độc lập**, chạy trong context riêng (không thấy lịch sử chat), có quyền công cụ (tools) giới hạn riêng. Dùng khi cần: (a) góc nhìn độc lập không bị nhiễm giả định của người viết code, (b) chạy song song nhiều việc, (c) giới hạn quyền (vd. reviewer không được sửa code).

Cả 2 đều tự động được cân nhắc gọi khi yêu cầu của bạn khớp với `description` — bạn **không cần gõ tên chính xác**, chỉ cần mô tả việc cần làm.

## 2. Hiện có gì

### Skills

| Tên | Gọi khi nào | Việc gì |
| --- | --- | --- |
| `implement` | Viết/thêm/sửa code | Đọc convention có sẵn → tránh trùng lặp → SOLID/DRY vừa đủ → tự review diff → chạy typecheck/lint thật |
| `code-review` | "review giúp tôi", "tìm bug" | Rà 8 khía cạnh (correctness → SOLID/DRY → naming → structure → error handling → performance → security → extensibility), verify từng finding trước khi báo |
| `refactor` | "tách file", "dọn code", không đổi hành vi | Tách theo sub-domain thật, xoá bản gốc trùng lặp, không trộn với sửa bug |

### Agents

| Tên | Quyền (tools) | Dùng khi nào |
| --- | --- | --- |
| `architect` | Read-only | **Trước khi viết code** cho feature/domain lớn — quyết định file/folder nằm đâu, tái dùng gì, tách module thế nào |
| `implementer` | Full (Read/Write/Edit/Bash...) | Giao 1 task đã scope rõ để viết code, đặc biệt khi cần chạy song song việc khác |
| `code-reviewer` | Read-only | Review độc lập sau khi code viết xong, trước khi báo "xong" |
| `security-reviewer` | Read-only | Code đụng tới user input/auth/thanh toán/upload, hoặc trước khi deploy |
| `perf-optimizer` | Full | Có nghi ngờ/đo được chỗ chậm thật — đo trước/sau, không tối ưu theo cảm tính |
| `tester` | Full | Sau khi implement xong, hoặc khi cần thêm test coverage |
| `debugger` | Read-only | Có lỗi/stack trace/test fail chưa rõ nguyên nhân gốc |

**Vì sao 1 số agent không có quyền Write/Edit**: cố ý tách "tìm ra vấn đề" khỏi "sửa code" cho review/audit/planning — reviewer/security-reviewer/architect/debugger chỉ báo cáo, agent khác hoặc tôi ở main thread mới áp dụng fix. Giữ mỗi thay đổi code có thể truy vết về đúng 1 quyết định rõ ràng.

## 3. Cách dùng hàng ngày

Không cần cú pháp đặc biệt — cứ nói bình thường:

- "implement thêm endpoint X" → tự áp dụng skill `implement`
- "review lại đoạn code tôi vừa viết" → tự áp dụng skill `code-review`, có thể tự dispatch agent `code-reviewer` nếu đủ lớn
- "tách file conversation.ts này ra cho gọn" → skill `refactor`
- "cái này có an toàn không, check bảo mật giúp" → agent `security-reviewer`
- "sao cái trang này load chậm vậy, tối ưu giúp" → agent `perf-optimizer`
- "lỗi này do đâu vậy, tôi không hiểu" → agent `debugger`

Muốn ép dùng ngay, không cần chờ tôi tự nhận diện:

- Skill: gõ `/implement`, `/code-review`, `/refactor`
- Agent: nói thẳng "dùng agent debugger để...", "nhờ code-reviewer agent xem hộ..."

## 4. Cách thêm 1 skill mới

1. Tạo `.claude/skills/ten-skill/SKILL.md`.
2. Frontmatter bắt buộc có `description` — đây là thứ **duy nhất** quyết định tôi có tự gọi skill hay không, viết theo công thức: _"Use when [tình huống cụ thể] — [skill làm gì, kết quả gì]"_, có ví dụ câu người dùng hay nói ("trigger for..."). Mô tả mơ hồ ("giúp code tốt hơn") sẽ không bao giờ được tự kích hoạt đúng lúc.
3. Nội dung: viết thành các bước/checklist hành động được (không phải bài luận lý thuyết) — tôi làm theo từng dòng, không diễn giải lại.
4. Giữ dưới ~500 dòng; phần nào dài/ít dùng thì tách file riêng, dẫn link từ SKILL.md.
5. Không lặp lại thứ Ultracite/oxlint (`.claude/CLAUDE.md`) đã tự enforce (format, a11y, hook rules...) — skill chỉ nên chứa phần **linter không bắt được**: kiến trúc, trùng lặp, cấu trúc thư mục, khi nào tách/khi nào gộp.
6. Test lại: nói 1 câu giống người dùng thật sẽ nói, xem tôi có tự áp dụng đúng skill không. Nếu không, mô tả chưa đủ cụ thể — sửa lại `description`.

## 5. Cách thêm 1 agent mới

1. Tạo `.claude/agents/ten-agent.md`.
2. Frontmatter: `name` (khớp tên file, chữ thường, gạch ngang), `description` (câu quyết định khi nào tôi tự delegate — dùng "Use PROACTIVELY when..." nếu muốn ưu tiên tự động, nêu rõ việc gì KHÔNG thuộc phạm vi agent này để tránh chồng lấn với agent khác), `tools` (liệt kê đúng cái cần — bớt quyền nếu agent chỉ cần đọc/báo cáo, không phải sửa), `model: inherit` (mặc định, dùng model của session cha).
3. Nội dung (system prompt): nói rõ (a) agent KHÔNG làm gì (vd. "không viết code, chỉ báo cáo"), (b) quy trình cụ thể từng bước, (c) format báo cáo kết quả mong muốn. Agent không thấy được lịch sử chat — mọi ngữ cảnh cần thiết phải nằm trong file này hoặc trong prompt lúc gọi nó.
4. Nếu agent có khả năng trùng việc với agent đã có (vd. thêm 1 "quality-reviewer" na ná `code-reviewer`) — cân nhắc mở rộng agent cũ thay vì tạo thêm, tránh 2 agent tranh nhau được tự động chọn cho cùng 1 tình huống.

## 6. Cách sửa/cập nhật khi đã có

- Sửa trực tiếp file `.md` — không cần khởi động lại gì, lượt chat tiếp theo đã đọc bản mới.
- Khi 1 quy ước của repo đổi (vd. đổi convention folder cho `services/`, đổi tool chạy lint), cập nhật cả:
  - Skill/agent liên quan trong `.claude/`
  - `packages/*/README.md` và `docs/runbook/*.md` nếu convention đó cũng được mô tả ở đó (tránh 2 nguồn lệch nhau)
- Nếu 1 skill/agent bị gọi sai lúc (quá tay hoặc không đủ) → sửa `description`, đây gần như luôn là nguyên nhân, không phải nội dung bên trong.
- Nếu nội dung 1 file phình to khó đọc → áp dụng chính skill `refactor` cho chính nó: tách phần ít dùng ra file riêng, dẫn link.

## 7. Cách xoá

1. Xoá file/folder tương ứng trong `.claude/skills/` hoặc `.claude/agents/`.
2. Grep lại toàn repo tên skill/agent đó (`grep -rn "ten-agent"`) — xoá tham chiếu còn sót ở skill khác, bảng ở file này, hoặc ghi chú trong code.
3. Không cần "deprecate" dần — đây là file cấu hình nội bộ, xoá thẳng an toàn, có git history nếu cần khôi phục.

## 8. Giữ hiệu quả lâu dài — vài nguyên tắc

- **`description` là tài sản quan trọng nhất của mỗi file** — quyết định tôi có tự dùng đúng lúc hay không. Đầu tư viết đúng cái này hơn là nội dung bên trong.
- **Không để 2 skill/agent chồng phạm vi** — mỗi cái nên trả lời rõ "khi nào KHÔNG dùng cái này" (đã viết sẵn trong từng file), nếu thấy 2 cái hay bị lẫn lộn, gộp lại hoặc thu hẹp mô tả.
- **Đừng lặp lại thứ tool khác đã lo** — Ultracite/oxlint lo format & lint-level rules; skill/agent ở đây chỉ lo phần cần tư duy (kiến trúc, trùng lặp, bảo mật thật, hiệu năng đo được).
- **Xem lại định kỳ** (vài tháng/lần, hoặc khi thấy mình phải nhắc lại cùng 1 điều nhiều lần) — nếu 1 điều bạn hay phải nói lại thủ công, đó là dấu hiệu cần thêm vào skill/agent tương ứng thay vì tiếp tục nhắc tay.
- **Mọi file ở đây đã nằm trong git** — thay đổi/xoá đều có lịch sử, không cần backup riêng.
