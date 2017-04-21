<?php
$postdata = file_get_contents("php://input");

$postdata = json_decode($postdata);
// when user "follows" (or "unfollows") a bill, first add (or remove) that bill to string of bill number followed in local storage then send that string to db
$billNumbers = $postdata->billNumbers; 
$email = $postdata->email;

require_once('dbconnect.php');

$updateSql = $conn->prepare("UPDATE activists SET billsFollowed=? WHERE email=?"); 

// "s" means the database expects a string
$updateSql->bind_param("ss", $billNumbers, $email);

if ($updateSql->execute() === TRUE) {
    //file_put_contents("editTest.txt", " record updated!! ", FILE_APPEND);
} else {
}
$updateSql->close();
//file_put_contents("editTest.txt", "At end of file", FILE_APPEND);

$conn->close();

?>