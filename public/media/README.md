# Đặt nhạc và ảnh của bạn tại đây

Ví dụ, chép ba file vào thư mục này:

- `nhac-cua-toi.mp3`
- `anh-hai-nguoi.png`
- `anh-co-gai.png`

Sau đó mở `public/content.json` ở thư mục cha và điền đường dẫn dạng `/media/ten-file.ext` vào `music` hoặc `images`. Tên file phải khớp hoàn toàn, kể cả chữ hoa/chữ thường và phần đuôi `.mp3`, `.png`, `.jpg`, `.webp`.

Ví dụ: file `public/media/nhac-cua-toi.mp3` ứng với `"music": "/media/nhac-cua-toi.mp3"`.

Không cần chép file vào `dist` hoặc sửa `index.html`.
