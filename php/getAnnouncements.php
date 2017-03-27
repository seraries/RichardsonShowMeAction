<?php //Get Announcements on Page Load

require_once('dbconnect.php');
file_put_contents("madeAnnounceTable.txt", " At start of file getAnnouncements! ");


// now send back updated array of announcements
$sql = "SELECT author, message, title FROM announce ORDER BY insertTime";

$result = $conn->query($sql);

$array = array();

if ($result->num_rows > 0) {
    // get each row and store in array
    while($row = $result->fetch_assoc()) {
        $array[] = $row;
        file_put_contents("madeAnnounceTable.txt", " got data! ", FILE_APPEND);
    }
} 
else {
    // echo "0 results";
}

$array = json_encode($array);

echo $array;
file_put_contents("madeAnnounceTable.txt", $array, FILE_APPEND);
$conn->close();

?>