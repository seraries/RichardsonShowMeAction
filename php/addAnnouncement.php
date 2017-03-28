<?php //add an Announcement

require_once('dbconnect.php');
$postdata = file_get_contents("php://input");
$postdata = json_decode($postdata);

$author = $postdata->author;
$title = $postdata->title;
$message = $postdata->message;

$insertSql = $conn->prepare("INSERT INTO announce (author, message, title, insertTime) VALUES (?, ?, ?, NOW())"); 

// "s" means the database expects a string
$insertSql->bind_param("sss", $author, $message, $title);

if ($insertSql->execute() === TRUE) {
    file_put_contents("addAnnounceTest.txt", " new record created!! ", FILE_APPEND);
} else {
    // echo "Error: " . $sql . "<br>" . $conn->error;
    // TO-DO: The line above created a ng-repeat dupes error, instead I want to 
    // let user know insert failed 
}
$insertSql->close();

// now send back updated array of announcements
$sql = "SELECT author, message, title FROM announce ORDER BY insertTime DESC";

$result = $conn->query($sql);

$array = array();

if ($result->num_rows > 0) {
    // get each row and store in array
    while($row = $result->fetch_assoc()) {
        $array[] = $row;
    }
} 
else {
    // echo "0 results";
}

$array = json_encode($array);

echo $array;

$conn->close();

file_put_contents("addAnnounceTest.txt", "at end of file", FILE_APPEND);

?>