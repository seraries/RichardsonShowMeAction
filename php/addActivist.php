<?php //add an activist

require_once('dbconnect.php');
$email = file_get_contents("php://input");

// Using Ignore b/c of Unique on email. So if email already in db, no error, just skip
// inserting it again--on front end I'll just store the email in user's local storage.
$insertSql = $conn->prepare("INSERT IGNORE INTO activists (email) VALUES (?)"); 

// "s" means the database expects a string
$insertSql->bind_param("s", $email);

if ($insertSql->execute() === TRUE) {
    //file_put_contents("addTest.txt", " new record created!! ", FILE_APPEND);
    //echo "ok";
} else {
	
}
$insertSql->close();

$conn->close();

?>