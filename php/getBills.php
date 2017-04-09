<?php //getBills

require_once('dbconnect.php');

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
    echo "0 results";
}

$array = json_encode($array);
// file_put_contents("data.txt", $array, FILE_APPEND);
echo $array;

$conn->close();

?>