<?php // Use this if I add a "stop alerts" button if people don't want emails anymore
$postdata = file_get_contents("php://input");
$postdata = json_decode($postdata);

$email = $postdata->email;

require_once('dbconnect.php');

$deleteSql = $conn->prepare("DELETE FROM activists WHERE email=?"); 

// "s" means the database expects a string
$deleteSql->bind_param("s", $email);

if ($deleteSql->execute() === TRUE) {
    // file_put_contents("editTest.txt", " record updated!! ", FILE_APPEND);
} else {
}
$deleteSql->close();
//file_put_contents("editTest.txt", "At end of file", FILE_APPEND);

$conn->close();

?>