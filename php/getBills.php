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
        // Note: I've not changed this time in php files for other dummy site
    	// if this has been inserted within 37 hrs (since php time is 7hrs ahead of sql time this is 30hrs), new is true and
    	// updated is false
   		if(time() - strtotime($row["insertTime"]) < 133200 ) {
	    	$row["updated"] = false;
	    	$row["new"] = true;
	    	file_put_contents("data.txt", "inside third if", FILE_APPEND);
			} 
			elseif (time() - strtotime($row["updateTime"]) < 133200) {
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