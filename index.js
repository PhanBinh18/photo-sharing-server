const express = require("express");
const app = express();
const cors = require("cors");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
// const CommentRouter = require("./routes/CommentRouter");
const session = require("express-session");

dbConnect();

app.use(
  cors({
    origin: "https://y975ng-3000.csb.app", // Chỉ định đích danh frontend được phép gọi
    credentials: true, // Cấp phép nhận và gửi cookie/session
  })
);
app.use(express.json());
// THÊM DÒNG NÀY ĐỂ CẤP QUYỀN TRUY CẬP VÀO THƯ MỤC IMAGES
app.use("/images", express.static(__dirname + "/images"));

app.set("trust proxy", 1);
// 1. Cấu hình session
app.use(
  session({
    secret: "secretKey", // Nên để trong file .env
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "none",
      secure: true,
    },
  })
);

// 2. Middleware kiểm tra đăng nhập cho tất cả các API (trừ admin)
app.use((req, res, next) => {
  // Cho phép đi qua nếu là route login/logout hoặc đã đăng nhập
  if (
    req.path === "/admin/login" ||
    req.path === "/admin/logout" ||
    (req.path === "/user" && req.method === "POST") ||
    req.session.user
  ) {
    next();
  } else {
    res.status(401).send("Unauthorized"); // Trả về 401 nếu chưa login
  }
});

// 3. Mount AdminRouter
app.use("/admin", require("./routes/AdminRouter"));
app.use("/user", UserRouter);
app.use("/", PhotoRouter);

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8081, () => {
  console.log("server listening on port 8081");
});
