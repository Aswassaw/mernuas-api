const { htmlTemplateTop, htmlTemplateBottom } = require("./template");

const resetPassword = (link) => {
  const htmlContent = `
  <p>
    Anda menerima email ini karena Anda telah melakukan permintaan untuk Reset Password di Mernuas.
    <br>
    Segera reset password Anda dengan click tombol di bawah ini.
  </p>
  
  <a href="${link}" style="color: white;" class="auth-button">Reset Password</a>
  
  <p>
    Token tersebut akan kedaluwarsa dalam 30 menit.
    <br>
    Jika Anda tidak merasa melakukan permintaan untuk Reset Password di Mernuas, abaikan email ini.
    <br>
    Link alternatif: <a href="${link}">${link}</a>
  </p>
  
  <hr>
  
  <p>Copyright &copy; ${new Date().getFullYear()} Mernuas - Developed with <span style="color: red !important;">🖤</span> by <a style="text-decoration: none;" href="https://github.com/andry-pebrianto" target="_blank">Andry Pebrianto</a> in Trenggalek</p>`;

  return htmlTemplateTop + htmlContent + htmlTemplateBottom;
};

module.exports = resetPassword;
