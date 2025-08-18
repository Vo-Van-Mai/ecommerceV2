# e-commerce
BÀI TẬP LỚN MÔN: CÁC CÔNG NGHỆ LẬP TRÌNH HIỆN ĐẠI (SỬ DỤNG DJANGO, DJANGO REST FRAMEWORK, MySQL)

TÊN ĐỀ TÀI: SÀN GIAO DỊCH THƯƠNG MẠI ĐIỆN TỬ

MỤC TIÊU ĐỀ TÀI:
- Đăng nhập (các vai trò quản trị, nhân viên sàn giao dịch, người bán hoặc người dùng
thường.
- Đăng ký người dùng (phải có avatar) có thể đăng kỳ vai trò người dùng cá nhân trên
hệ thống hoặc vai trò đại duyện tiểu thương hoặc doanh nghiệp (gọi chung là người
bán) để giao dịch trên sàn. Khi đăng ký vai trò tiểu thương hoặc doanh nghiệp cần sự
xác nhận của nhân viên hệ thống.
- Người bán khi đăng ký thành công có thể tạo cửa hàng và đăng các sản phẩm buôn bán
của mình, mỗi sản phẩm được bán.
- Người dùng được phép thực hiện các chức năng tra cứu sản phẩm linh hoạt theo tên,
mức giá, cửa hàng bán và sắp xếp các sản phẩm hiển thị theo tên hoặc giá. Các sản
phẩm hiển thị phải được phân trang tối đa 20 sản phẩm/trang.
- Người dùng được phép đánh giá (review) người bán bằng cách đánh số sao (1 đến 5)
hoặc viết bình luận trực tiếp. Ngoài ra, người dùng cũng được đánh giá, bình luận, phản
hồi bình luận cho các sản phẩm trên hệ thống.
- Người dùng được phép thực hiện mua hàng online. Người dùng có thể chọn hình thức
thanh toán tiến mặt khi nhận hàng hoặc thanh toán online thông qua papal hoặc stripe
hoặc zalo pay hoặc momo, tất cả khoản tiền người dùng thanh toán đều phải được ghi
nhận vào hệ thống.
- Hệ thống có chức năng so sánh các sản phẩm cùng loại của các cửa hàng khác nhau,
thông tin so sanh sao cho hiệu quả giúp được người dùng lựa chọn mua hợp lý.
- Người bán được phép xem thống kê doanh thu các sản phẩm, danh mục sản phẩm theo
tháng, quý và năm.
- Người quản trị sàn giao dịch có thể xem thống kê tần suất bán hàng, tổng sản phẩm
kinh doanh của các cửa hàng theo tháng, quý, năm. Sinh viên có thể phát triển thống
kê này linh hoạt hơn để các quản trị cúa thể quản lý tốt hơn thông tin sàn giao dịch.
- *Sinh viên nghiên cứu thêm dùng firebase tích hợp chat thời gian thực.

  KẾT QUẢ ĐẠT ĐƯỢC:
  - Đăng kí người dùng với các vai trò: admin, người bán, người mua (có yêu cầu upload avatar
    và lưu trữ bằng cloudinary).
  - Người bán đang kí của hàng và đăng bán sản phẩm khi được quản trị viên duyệt
  - Người dùng có thể xem và thêm sản phẩm vào giỏ hàng và có thể mua
  - Thanh toán bằng 2 hình thức: tiền mặt khi nhận hàng hoặc thanh toán online (chưa ổn định cần sửa chữa)
  - Các chức năng thống kê cho người quản trị và người bán (theo tháng, quý, năm)
  - Người dùng được phép bình luận và đánh giá bằng số sao
