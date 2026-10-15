# Báo cáo khảo sát và so sánh

Ngày khảo sát: 15/10/2026. Website gốc: <https://20-10-vuive.kazvndc-edu.workers.dev/>.

## Cập nhật cảnh cuối theo yêu cầu cá nhân hóa

Bản đang chạy thay toàn bộ gian hàng, popup mua hàng và footer DA Labs bằng một lời kết dẫn tới TikTok `@congabuon` và GitHub `Kakajshd`. Nền sao, hoa, bướm, mắt Tiny và chuyển động đưa mắt sang cảnh cuối được giữ lại. Chữ và URL của cảnh này nằm trong `public/content.json` → `ending`.

Kiểm thử mới ở `comparison/personal-ending/`: bốn ảnh viewport 1920×1080, 1366×768, 390×844, 360×800; `results.json` ghi nhận không có sản phẩm/footer cũ, không tràn ngang trong cảnh cuối, hai link hiển thị, không có lỗi JavaScript và nội dung/link thay đổi đúng theo cấu hình thử. `actual-flow-results.json` ghi nhận đi hết hành trình trên desktop và mobile bằng click/chạm, mắt Tiny chuyển sang cảnh mới, bướm còn hoạt động và cả hai liên kết mở đúng URL trong tab mới. Bản production và cách mở qua máy chủ tĩnh đều đã kiểm tra; `npm run build` thành công. Các phép so sánh pixel với website gốc ở phần dưới được thực hiện **trước khi đổi cảnh cuối**; cảnh cuối hiện nay khác bản gốc theo đúng yêu cầu, nên không áp dụng mục tiêu 95% cho riêng cảnh đó.

## Môi trường và MCP

Node.js `v22.12.0`, npm/npx `10.9.0`, Codex CLI `0.155.0-alpha.16.3`. Trước khi cấu hình, `codex mcp list` không có server nào. Lệnh `codex mcp add playwright npx "@playwright/mcp@latest"` đã thêm một block `[mcp_servers.playwright]` vào `C:\Users\ducng\.codex\config.toml` mà không sửa các mục cũ. Lệnh `codex mcp list` xác nhận enabled. Package MCP khởi chạy được và handshake thật nhận 25 công cụ; chi tiết ở `reference/mcp-verification.json`.

## Cấu trúc và tài nguyên

Trang gốc là một document HTML khoảng 7,61 MB với CSS/JavaScript chủ yếu viết trực tiếp trong document. HTML chứa 14 hình dạng data URI, 1 MP3 dài 114,59 giây, 2 canvas khai báo sẵn, 45 SVG inline và 158 định nghĩa `@keyframes`. Một số canvas/SVG khác được tạo trong lúc chạy. Network log ban đầu chỉ có document và hai file font Courier Prime từ Google Fonts. Bản local giữ tài nguyên nhúng, lưu font ở `public/fonts/` và dùng Vite để build.

## Luồng trải nghiệm

1. Nền đen, chữ Courier Prime sáng và mắt Tiny. Nhạc tự phát nếu trình duyệt cho phép; nếu bị chặn, click đầu sẽ bắt đầu phát.
2. Click/chạm nền lần 1 và 2 hiện lời giới thiệu. Lần 3 bị khóa đến khi nhạc đạt 9,7 giây. Nhạc dừng và giảm âm ở mốc này rồi tiếp tục khi click.
3. Các cảnh sau lần lượt có ánh hồng, hoa rơi, sao và sao băng, hình hai cô gái, lá vàng, lời chúc sức khỏe và sắc đẹp, nụ cười, cỏ bốn lá và lời chúc may mắn.
4. Cảnh câu hỏi chuyển sang máy bay. Nút **Đồng ý** kích hoạt tiến trình tiếp nhiên liệu khoảng 1,8 giây, tự cất cánh, hiện cảnh “reality”, rồi mở cảnh cuối.
5. Ở website gốc, cảnh cuối là gian hàng với sản phẩm Shopee và footer DA Labs. Bản cá nhân hóa hiện dùng lời kết và hai liên kết TikTok/GitHub.

Trang không dùng scroll để đổi các cảnh kể chuyện; body khóa tràn. Cảnh cuối là vùng cuộn riêng khi nội dung cao hơn màn hình. Trên mobile, chạm hoạt động như click và mã gốc hạ mật độ/cỡ render Canvas theo thiết bị. Quỹ đạo sao băng, cánh hoa, lá rơi, chớp mắt, bướm và chuyển cảnh được giữ từ CSS/JS gốc, bao gồm thời lượng, easing, delay và thứ tự. Vì có `Math.random()` và animation liên tục, hai phiên Chromium độc lập không đồng bộ từng frame tuyệt đối dù dùng cùng mã.

## Kiểm thử

- `npm run build` thành công.
- So sánh screenshot ở 1920×1080, 1366×768, 390×844 và 360×800: khung đầu tiên trùng pixel hoàn toàn. Khung sau click đầu có sai khác màu trung bình từ 0 đến 0,015% trên thang RGB 0–1.
- Kiểm tra sâu ở 1366×768 và 390×844 trước khi cá nhân hóa: bản gốc và local cùng đi đến cảnh hoa, sắc đẹp, máy bay, gian hàng và modal. Tên cảnh, lời đang hiển thị và đồng hồ nhạc được ghi trong `comparison/deep/results.json`.
- Difference image có trong `comparison/`. Ở các cảnh đang chuyển động, sai khác lớn hơn do vị trí ngẫu nhiên của hạt/lá, nhịp chớp mắt và thời điểm chụp. Khi chờ gian hàng và modal ổn định, sai khác màu trung bình còn khoảng 0,032–0,187% trên mobile và 0,088–0,123% trên desktop (`comparison/modal/metrics.json`). Đây vẫn chưa phải phép đo tin cậy để xác nhận “95% giống tổng thể”.
- Ở bản gốc, có lỗi console khi fade-in nhạc: gán volume âm trong một frame. Bản local đã chặn giá trị volume vào khoảng `[0,1]` trong đoạn đó. Trình duyệt MCP còn ghi nhận favicon 404 ở bản gốc; bản local khai báo favicon dạng data URI để tránh request này.
- Handshake Playwright MCP thành công: 25 công cụ, gồm `browser_navigate`, `browser_take_screenshot`, `browser_click`, `browser_drag`, `browser_hover`. Tool MCP thực sự đã mở website gốc và lưu ảnh `reference/mcp-screenshot.png`.
- Thao tác drag trên nền chuyển đến cùng lời “tớ là Tiny” ở cả hai bản. Vuốt chạm trong gian hàng mobile cuộn đúng 435 px ở cả hai bản; số đo scrollHeight/clientHeight đều là 2370/870 px (`comparison/gestures.json`). Modal mở và đóng bằng Escape trên cả desktop/mobile.
- Cấu hình mới đã được kiểm tra trên bản production bằng cách nạp thử tên “Linh”, lời giới thiệu khác, tiêu đề/nút cảnh máy bay khác, ảnh/nhạc tùy chỉnh, mốc nhạc 3,5 giây và hai câu lyric. DOM và các hằng thời gian phản ánh đúng cấu hình; lượt chạy mặc định không có lỗi console hay request thất bại.

## Giới hạn và khác biệt

- Chưa có phép đo định lượng toàn hành trình đủ mạnh để khẳng định đạt 95%. Các cảnh kể chuyện và tài nguyên mặc định được giữ nguyên; cảnh cuối được cá nhân hóa theo yêu cầu, font chuyển sang local, liên kết chia sẻ trỏ về trang đang chạy và lỗi volume âm đã được sửa.
- Liên kết TikTok/GitHub trong bản cá nhân hóa mở trang ngoài ở tab mới; việc xem nội dung cần kết nối đến các website đó.
- Đổi MP3 trong `content.json` không tự đổi lời hát được đồng bộ theo thời gian của bài gốc.
- Playwright MCP đã được cấu hình và xác minh qua giao thức MCP, nhưng phiên Codex hiện tại chưa hot-load công cụ. Khởi động lại phiên VS Code Codex để gọi các công cụ đó trực tiếp trong hội thoại.
