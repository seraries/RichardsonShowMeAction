<?php //getBills

require_once('dbconnect.php');

$sql = "SELECT billNum, billLink, branch, position, why, contactTitle, contactLink, insertTime, updateTime FROM bills";

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
// file_put_contents("insertUser.txt", $array);

?>