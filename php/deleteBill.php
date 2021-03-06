<?php
$bill = file_get_contents("php://input");

require_once('dbconnect.php');

// Use prepared statement to avoid sql injection attack
$deleteSql = $conn->prepare("DELETE FROM bills WHERE billNum = ?");

// "s" means the database expects a string
$deleteSql->bind_param("s", $bill);

if ($deleteSql->execute() === TRUE) {
} else {
    // echo "Error: " . $sql . "<br>" . $conn->error;
}

$deleteSql->close();

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
   		if(time() - strtotime($row["insertTime"]) < 10800 ) {
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
    echo "0 results";
}

$array = json_encode($array);

echo $array;

$conn->close();

?>