<?php
$postdata = file_get_contents("php://input");
$postdata = json_decode($postdata);

$id = $postdata->id;
$link = $postdata->link;
$branch = $postdata->branch;
$vote = $postdata->vote;
$why = $postdata->why;
$who = $postdata->who;
$linkToWho = $postdata->linkToWho;

require_once('dbconnect.php');

// TO-DO check valid user again somehow--send json via angular that has bill data and login data?

// Use prepared statement to avoid sql injection attack
$insertSql = $conn->prepare("INSERT INTO bills (billNum, billLink, branch, position, why, contactTitle, contactLink, insertTime)
VALUES (?, ?, ?, ?, ?, ?, ?, NOW())"); 

// "s" means the database expects a string
$insertSql->bind_param("sssssss", $id, $link, $branch, $vote, $why, $who, $linkToWho);

if ($insertSql->execute() === TRUE) {
    //file_put_contents("insertTest.txt", " new record created!! ", FILE_APPEND);
} else {
    // echo "Error: " . $sql . "<br>" . $conn->error;
    // TO-DO: The line above created a ng-repeat dupes error, instead I want to 
    // let user know insert failed 
}
$insertSql->close();

// now send back updated array of bills
$sql = "SELECT billNum, billLink, branch, position, why, contactTitle, contactLink, insertTime, updateTime FROM bills";

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

?>