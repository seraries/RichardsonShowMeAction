<?php //Get Contacts on Page Load

require_once('dbconnect.php');

$sql = "SELECT title, link FROM stateContacts";

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

?>