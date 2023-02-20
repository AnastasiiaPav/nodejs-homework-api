const createHTML = (email, baseRef, token) => {
    const [name] = email.split("@");

const document = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
 <head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>Demystifying Email Design</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin: 0; padding: 0;">
<table align="center" border="1" cellpadding="0" cellspacing="0" width="600">
 <tr>
  <td bgcolor="#70bbd9">
  Please verify your email address!
  </td>
 </tr>
 <tr>
  <td bgcolor="#ffffff">
  <a href="${baseRef}/api/users/verify/${token}"  target="_blank">Verify Email</a>  </td>
 </tr>
 <tr>
  <td bgcolor="#ee4c50">
  Thanks , ${name}! See you!
  </td>
 </tr>
</table>
</html>`

return document
}

module.exports = createHTML