<?php //getBills

require_once('dbconnect.php');

$sql = "SELECT billNum, billLink, branch, position, why, contactTitle, contactLink FROM bills";
// fig out how to make a json object that has 2 data sets, one for house bills and one for senate
// then do two select statements to get these so they will be separate when returned to angular
$result = $conn->query($sql);

$array = array();

if ($result->num_rows > 0) {
    // get each row and store in array
    while($row = $result->fetch_assoc()) {
        $array[] = $row;
    }
} else {
    echo "0 results";
}

$array = json_encode($array);

echo $array;

$conn->close();
file_put_contents("insertUser.txt", "at end of file", FILE_APPEND);

?>