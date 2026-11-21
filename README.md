# n8n-sheet-priority-queue

Mẫu **Code node cho n8n**: mỗi lượt chạy chọn 1 URL để xử lý (làm video, đăng social, viết bài…). Ưu tiên những link bạn **tự dán vào Google Sheets** trước, hết thì mới lấy theo **sitemap**. Kết quả ghi lại **đúng dòng đã dán**.

## Cách hoạt động

1. Đọc Sheet. Dòng nào **có URL nhưng Title và Status còn trống** là dòng ưu tiên, lấy từ trên xuống.
2. Link dán tay được chuẩn hoá: thêm `https`, bỏ `www` và `?utm=…`, link trang con đổi về trang cha, thêm `/` cuối. Link không hợp lệ hoặc đã làm ở dòng khác thì bỏ qua.
3. Hết dòng ưu tiên thì lấy item mới nhất trong sitemap chưa có trong Sheet.
4. Trả về `sheet_key` là **nguyên văn** URL trong Sheet.

## Ghi lại đúng dòng

Trong node Google Sheets **Append or Update**, chọn cột match là `URL` và đặt:

```
URL = {{ $('Pick Item').first().json.sheet_key }}
```

Vì giá trị match giống hệt chữ trong ô, n8n cập nhật đúng dòng đó thay vì thêm dòng mới, kể cả khi bạn dán link thiếu `https` hay có `?utm`.

## Cài đặt

1. Thêm node **Code** tên `Pick Item`, dán `pick-item.js`.
2. Sửa các hằng `SHEET_NODE`, `SITEMAP_NODE`, `HOST`, `ITEM_PATH` cho site của bạn.
3. Node đọc Sheet nên bật **Execute Once** và **Always Output Data** để Sheet trống vẫn chạy.

Đang dùng cho WF làm video và đăng social của [Truyện Kể](https://truyenke.com).

## License

MIT
