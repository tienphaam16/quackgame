# Tool Quack Quack Game

> Đây công cụ tui làm ra chỉ để thử sức code nên nó rất đơn giản. Công việc của tui là Sửa Laptop chứ không phải Dev mấy má ưi 😍

> Windows / Mac / Linux đều dùng được miễn có cài NodeJS. Link tải đây https://nodejs.org/en/download/prebuilt-installer

> Mọi người có hứng thú với con game vô tri này thì đăng ký qua link ủng hộ tui nhé https://t.me/quackquack_game_bot?start=6hn8Xrp7DK

> Link Tool https://j2c.cc/quack, các link khác đều là bản copy, cẩn thận khi sử dụng bản copy

## Tính năng

> Lụm Zịt Zàng (có thể bật|tắt trong file config.json)

> Không claim TON từ Zịt Zàng (vì muốn claim phải có key ví, ai lại đi bỏ key ví vào Tool người khác bao giờ)

> Lụm toàn bộ trứng (có thể bật|tắt trong file config.json)

> Bản cập nhật này chỉ để thêm các thư viện  (axios, easytimer, random-useragent) để Tool hoạt động ổn định hơn

> Chưa có ấp trứng kiếm vịt xịn, nhưng trong tương lai gần sẽ có

## Cách dùng

> Cài NodeJS chưa? Chưa thì quay lên trên lấy link tải về cài vào

> Tải Tool về, thấy cái nút (<> Code) màu xanh lá ở trên hem? bấm vào đó để Download ZIP

> Giải nén và truy cập vào folder của Tool

> Cần hiện đuôi file để thao tác dễ hơn, ví dụ file config.json mà máy không hiện đuôi file thì chỉ nhìn thấy file có tên config

> Copy Token game paste vào file token.json rồi lưu lại. Nếu chưa có thì tạo mới (Chuột phải > New > Text Document > token.json)

> Cách lấy Token game, xem hình dưới nè

<img src="./images/1.png" />

> Cài đặt Tool ở file config.json

```json
{
  "nest": 3, // số tổ vịt bạn đang có, nếu có nhiều hơn thì thay số vào
  "sleepTime": 3, // thời gian nghỉ giữa mỗi request (thao tác), đơn vị: s (second)
  "goldenDuck": "on", // on|off : bật|tắt đập vịt vàng
  "harvestEgg": "on", // on|off : bật|tắt lụm tất cả trứng, không phân biệt trứng xịn|lỏ
}
```

> Mở Terminal / PowerShell / Cmd trong folder Tool

> Gõ vào lệnh ```npm install``` để cài đặt các thư viện cần thiết

> Gõ vào lệnh ```node quack``` để khởi chạy

<img src="./images/2.png" />

> Xem lại lịch sử đập Zịt Zàng ở file log.txt

<img src="./images/3.png" />

From https://mhqb365.com with Love ♥