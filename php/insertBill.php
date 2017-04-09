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

// check if billNum already exists in database and send back error message if it does
// else proceed with insert and select of updated bills table.
$selectSql = $conn->prepare("SELECT * FROM bills WHERE billNum = ?");
$selectSql->bind_param("s", $id);
if ($selectSql->execute()) {
}
$result = $selectSql->get_result(); 

if ($result->num_rows > 0) {
	// record for this bill num already exists, so just return an error message.
		$resp->message = "dupe";
		$resp = json_encode($resp);
		echo $resp;
} 
else {
    // no records, so we can go ahead and create one and return updated array
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
	   		if(time() - strtotime($row["insertTime"]) < 86400 ) {
		    	$row["updated"] = false;
		    	$row["new"] = true;
		    	file_put_contents("data.txt", "inside third if", FILE_APPEND);
				} 
				elseif (time() - strtotime($row["updateTime"]) < 86400) {
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
}

$conn->close();

?>