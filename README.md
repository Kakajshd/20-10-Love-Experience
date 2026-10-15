# Tiny 20/10 — bản dựng local

Trang này chạy độc lập bằng Vite. Các cảnh kể chuyện, hình, âm thanh và hiệu ứng được giữ từ HTML công khai của [website tham chiếu](https://20-10-vuive.kazvndc-edu.workers.dev/). Cảnh quảng cáo cuối đã được thay bằng lời kết cá nhân cùng liên kết TikTok `@congabuon` và GitHub `Kakajshd`. Font Courier Prime được nhúng từ `public/fonts/`; trang không cần tải tài nguyên từ website tham chiếu hay Google Fonts.

## Chạy trên máy

Yêu cầu Node.js 20 trở lên.

```bash
npm install
npm run dev
```

Mở `http://127.0.0.1:5173/`. Click vào nền trên máy tính hoặc chạm trên điện thoại để chuyển cảnh. Sau hai lần click đầu, chờ nhạc đến mốc 9,7 giây rồi click tiếp. Ở cảnh máy bay, nhấn **Đồng ý** để tiếp nhiên liệu và mở các cảnh cuối.

## Đổi nhạc và ảnh: làm theo 3 bước

1. Chép file của bạn vào thư mục [`public/media/`](public/media/). Ví dụ: `nhac-cua-toi.mp3`, `anh-hai-nguoi.png`, `anh-co-gai.png`. Đặt tên file ngắn, không dấu và không có khoảng trắng để dễ điền.
2. Mở [`public/content.json`](public/content.json). **Chỉ thay các chuỗi rỗng** ở `images` và `music`, chẳng hạn:

   ```json
   "images": {
     "twoPeople": "/media/anh-hai-nguoi.png",
     "womanDesktop": "/media/anh-co-gai.png",
     "womanMobile": "/media/anh-co-gai.png"
   },
   "music": "/media/nhac-cua-toi.mp3"
   ```

3. Lưu file và tải lại trang bằng **Ctrl+F5**. Với `npm run dev`, trang ở `http://127.0.0.1:5173/`; với VS Code Live Server, trang thường ở `http://127.0.0.1:5500/`. Không sửa `index.html` hoặc `dist`.

`twoPeople` là ảnh hai người trong cảnh 20/10. `womanDesktop` là ảnh nền cô gái ở cảnh lời chúc trên máy tính; `womanMobile` là ảnh cô gái trên điện thoại. Có thể dùng cùng một file cho `womanDesktop` và `womanMobile`. Ảnh PNG/WebP có nền trong suốt sẽ gần bố cục gốc nhất. Để một ô rỗng nếu bạn muốn giữ ảnh hoặc nhạc mặc định tại vị trí đó.

Nếu bài nhạc mới cần chạy lâu hơn trước khi trang chờ click, đổi `musicTiming.holdAt` từ `9.7` thành số giây muốn phát, nhỏ hơn thời lượng file. Ví dụ muốn phát 30 giây thì đặt `"holdAt": 30`. Đặt `"lyrics": []` nếu lời hát cũ không khớp nhạc mới. Trình duyệt có thể yêu cầu click/chạm đầu tiên trước khi phát tiếng.

## Sửa nội dung

Chỉnh [`public/content.json`](public/content.json), sau đó tải lại trang. Không cần sửa `index.html`.

- `recipientName`: tên người nhận. Để rỗng sẽ giữ nguyên chữ “cậu”.
- `greetings`: các dòng từ `text-1` đến `text-13`. Dùng `\n` để xuống dòng. Những dòng có cụm chữ màu trong bản gốc giữ hiệu ứng nhấn màu khi giữ nguyên cụm chữ.
- `shareScene`: chữ của cảnh máy bay trong ảnh bạn gửi. `heading` là dòng trắng, `question` là dòng xanh, `thanks` hiện sau khi nhấn, và `button` là chữ trên bình nhiên liệu. Giữ chữ nút ngắn để vừa với bình trên điện thoại.
- `images`: ba ô `twoPeople`, `womanDesktop`, `womanMobile` tương ứng với ba vị trí ảnh nêu trên. Các CSS selector cũ vẫn dùng được nếu bạn cần thay ảnh khác.
- `music`: đường dẫn MP3 trong `public/`, ví dụ `"/media/nhac-cua-ban.mp3"`. Để rỗng sẽ dùng bản nhạc nhúng gốc.
- `musicTiming.holdAt`: giây mà nhạc tạm dừng để chờ người xem click tiếp. Giá trị mặc định là `9.7`; với nhạc mới, đặt nhỏ hơn thời lượng bài. `fadeDuration` là số giây giảm âm trước mốc đó, `volume` nằm từ `0` đến `1`.
- `lyrics`: `null` để dùng lời hát gốc, `[]` để tắt chữ lời hát, hoặc một mảng `{ "time": số_giây, "text": "câu hát" }` để đồng bộ lời hát mới. Chữ lời hát chỉ xuất hiện ở cảnh nụ cười như bản gốc.
- `ending`: nội dung lời kết và hai liên kết. Đổi `titleTop`, `titleAccent`, `titleSuffix`, `kicker`, `message`, `description`, `signoff` để sửa chữ; đổi `tiktokLabel`, `tiktokUrl`, `githubLabel`, `githubUrl` để sửa tên và đường dẫn. Chỉ dùng URL bắt đầu bằng `https://` hoặc `http://`.

Ví dụ: để đổi các câu trong hai ảnh đầu và cảnh máy bay, sửa `text-2`, `text-3` trong `greetings`, rồi sửa `heading`, `question`, `button` trong `shareScene`.

Đặt ảnh/nhạc tùy chỉnh trong `public/media/`. Các ảnh mặc định và bản nhạc mặc định đã được nhúng sẵn vào `index.html`.

`index.html` được tạo bởi `prepare-site.mjs`. Khi đổi giao diện cảnh cuối, sửa `public/ending.css` hoặc `prepare-site.mjs`; `npm run dev` và `npm run build` sẽ tạo lại file này, còn với VS Code Live Server thì chạy `node prepare-site.mjs` rồi tải lại trang. Không sửa trực tiếp phần giao diện sinh sẵn trong `index.html`, vì lần tạo tiếp theo sẽ ghi lại nó. Nội dung và font cũng hoạt động qua Live Server ở `127.0.0.1:5500`; dùng Vite để kiểm thử và build bản triển khai.

## Build và Cloudflare Pages

```bash
npm run build
npm run preview
```

Trong Cloudflare Pages, chọn framework **Vite**, lệnh build `npm run build`, thư mục output `dist`. Trang dùng một route `/` và không cần biến môi trường. File `dist/index.html` khoảng 7,0 MB vì chứa ảnh, font và MP3 nhúng; kiểm tra giới hạn upload của tài khoản Cloudflare trước khi triển khai.

## Playwright MCP trong Codex

Đã thêm server bằng `codex mcp add playwright npx "@playwright/mcp@latest"`. `codex mcp list` hiển thị `playwright` ở trạng thái enabled. Script `verify-mcp.mjs` thực hiện handshake MCP thật, tìm thấy 25 công cụ, mở website gốc bằng `browser_navigate` và lưu ảnh bằng `browser_take_screenshot`. **Khởi động lại phiên Codex trong VS Code** để các công cụ `browser_*` của MCP được nạp trực tiếp vào phiên mới. Các script khảo sát và so sánh còn lại dùng thư viện Playwright trực tiếp để lấy nhiều frame và số liệu pixel.

## Bằng chứng khảo sát

Xem [`REPORT.md`](REPORT.md), ảnh trong `reference/` và ảnh so sánh/difference image trong `comparison/`.
