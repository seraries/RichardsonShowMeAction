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

//file_put_contents("editTest.txt", "At start of file");
require_once('dbconnect.php');

// TO-DO check valid user again somehow--send json via angular that has bill data and login data?

// Use prepared statement to avoid sql injection attack
$updateSql = $conn->prepare("UPDATE bills SET billLink=?, branch=?, position=?, why=?, contactTitle=?, contactLink=?, updateTime=NOW() WHERE billNum=?"); 

// "s" means the database expects a string
$updateSql->bind_param("sssssss", $link, $branch, $vote, $why, $who, $linkToWho, $id);

if ($updateSql->execute() === TRUE) {
    // file_put_contents("editTest.txt", " record updated!! ", FILE_APPEND);
} else {
    // echo "Error: " . $sql . "<br>" . $conn->error;
    // TO-DO: The line above created a ng-repeat dupes error, instead I want to 
    // let user know insert failed 
}
$updateSql->close();
file_put_contents("editTest.txt", "At end of file", FILE_APPEND);

// now send back updated array of bills
$sql = "SELECT * FROM bills";

$result = $conn->query($sql);

$array = array();

if ($result->num_rows > 0) {
    // get each row and store in array
    while($row = $result->fetch_assoc()) {
    	// add properties updated and new with boolean values
    	$row["updated"] = false;
    	$row["new"] = false; 
    	// if this has been inserted within 24 hrs (1440 minutes, 86400 seconds), new is true and
    	// updated is false
   		if(time() - strtotime($row["insertTime"]) < 10800) {
	    	$row["updated"] = false;
	    	$row["new"] = true;
	    	file_put_contents("data.txt", "inside third if", FILE_APPEND);
			} 
			elseif (time() - strtotime($row["updateTime"]) < 10800) {
	    	$row["updated"] = true;
	    	$row["new"] = false;
			}
    
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