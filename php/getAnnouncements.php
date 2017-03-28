<?php //Get Announcements on Page Load

require_once('dbconnect.php');

// now send back updated array of announcements, most recent first
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

?>