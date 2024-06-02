# Tool Quack Quack Game

> Đây công cụ tui làm ra chỉ để thử sức code nên nó rất đơn giản. Công việc của tui là Sửa Laptop chứ không phải Dev mấy má ưi 😍

> Windows / Mac / Linux đều dùng được miễn có cài NodeJS. Link tải đây https://nodejs.org/en/download/prebuilt-installer

> Mọi người có hứng thú với con game vô tri này thì đăng ký qua link ủng hộ tui nhé https://t.me/quackquack_game_bot?start=6hn8Xrp7DK

> Link Tool https://j2c.cc/quack

## Tính năng

> Lụm Zịt Zàng (cái con bạch tuột mỏ vịt xuất hiện mỗi 30 phút)

> Không claim được TON từ Zịt Zàng (muốn claim phải có key ví, ai lại đi bỏ key ví vào Tool bao giờ)

> Lụm toàn bộ trứng

> Bản cập nhật này chỉ để thêm các thư viện  (axios, easytimer, random-useragent) để Tool hoạt động ổn định hơn

> Chưa có ấp trứng kiếm vịt xịn, nhưng trong tương lai gần sẽ có

## Cách dùng

> Cài NodeJS chưa? Chưa thì kéo lên trên lấy link tải về cài vào

> Tải Tool về, thấy cái nút (<> Code) màu xanh lá ở trên hem? Bấm vào đó để Download ZIP

> Giải nén và truy cập vào folder của Tool

> Máy tính cần hiện đuôi file để thao tác dễ hơn

> Ví dụ file ```config.json``` mà máy không hiện đuôi file thì chỉ nhìn thấy cái file có tên ```config``` thôi

> Copy Token game paste vào file ```token.json``` rồi lưu lại. Nếu chưa có thì tạo mới (Chuột phải > New > Text Document > token.json)

> Xem cái hình dưới đây để lấy Token game

<img src="./images/1.png" />

> Cài đặt Tool ở file ```config.json```

```json
{
  "nest": 3, // số tổ vịt bạn đang có, nếu có nhiều hơn thì thay số vào
  "sleepTime": 1, // thời gian nghỉ giữa mỗi request (thao tác), đơn vị: s(second), số càng lớn thì càng chậm
}
```

> Mở Terminal / PowerShell / Cmd trong folder Tool

> Gõ vào lệnh ```npm install``` để cài đặt các thư viện cần thiết

> Gõ vào lệnh ```node quack``` để khởi chạy

<img src="./images/2.png" />

> Xem lại lịch sử lụm Zịt Zàng ở file ```log.txt```

<img src="./images/3.png" />

From https://mhqb365.com with Love ♥ and GoodLuck