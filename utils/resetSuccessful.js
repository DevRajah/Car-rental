const resetSuccessfulHTML = (req) => {
    return  `


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            text-align: center;
            color: #333;
        }
        p {
            color: #666;
            line-height: 1.6;
            text-align: center;
            font-size: 15px;
        }
        .success-icon {
            text-align: center;
            margin-bottom: 20px;
        }
        .success-icon img {
            width: 150px;
            height: auto;
        }
        .btn {
            display: inline-block;
            background-color: #007bff;
            color: #fff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s ease;
        }
        .btn:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon">
            <img src="https://static.vecteezy.com/system/resources/previews/005/163/927/non_2x/login-success-concept-illustration-flat-design-eps10-modern-graphic-element-for-landing-page-empty-state-ui-infographic-icon-vector.jpg" alt="Success Icon">
        </div>
        <h1>Password Reset Successful!</h1>
        <p>Your password has been successfully reset. You can now log in with your new password.</p>
        <p>If you did not initiate this action, please contact support immediately.</p>
        <div style="text-align: center;">
            <a href="https://fivesquares.onrender.com/" class="btn">Proceed to Login</a>
        </div>
    </div>
    <script>
        setTimeout(() => {
            window.location.href ="https://fivesquares.onrender.com/";
        }, 5000)

    </script>
</body>
</html>


`

}


module.exports = resetSuccessfulHTML;