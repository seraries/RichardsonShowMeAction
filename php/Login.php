<?php
$loginInfo = file_get_contents("php://input");
$loginInfo = json_decode($loginInfo);

$username = $loginInfo->username;
$password = $loginInfo->password;
// this gets $conn from db using config info
require_once('dbconnect.php');

// Using my own hash function since switching to php 5.6 from 5.4 on go daddy 
// was such a hassle and lead to get_result not working.
if(!function_exists('hash_equals')) {
  function hash_equals($str1, $str2) {
    if(strlen($str1) != strlen($str2)) {
      return false;
    } else {
      $res = $str1 ^ $str2;
      $ret = 0;
      for($i = strlen($res) - 1; $i >= 0; $i--) $ret |= ord($res[$i]);
      return !$ret;
    }
  }
}
// Value:
// $2a$10$eImiTXuWVxfM37uY4JANjOL.oTxqp7WylW7FCzx2Lc7VLmdJIddZq
//In the above example we turned a reasonably strong password into a hash that we can safely store in a database. 
//The next time the user logs in we can validate the password as follows:

$stmt = $conn->prepare("SELECT hash FROM stateUsers WHERE username = ?");

$stmt->bind_param('s', $username);

$stmt->execute();

$result = $stmt->get_result(); 

// let angular know if this was successful login. Have to use object since angular
// expects json so php must return json.
$resp->message = "no";
while ($user = $result->fetch_object()) {
	// Hashing the password with its hash as the salt returns the same hash
	if ( hash_equals($user->hash, crypt($password, $user->hash)) ) {
	  // Ok!
		file_put_contents("testData.txt", "success! ");
		$resp->message = "ok";
		//file_put_contents("testData.txt", $resp->message, FILE_APPEND);
		$resp = json_encode($resp);
		file_put_contents("testData.txt", $resp, FILE_APPEND);
		echo $resp;
	}
}

$stmt->close();

$conn->close();

/* Couldn't use (when I switched php version in godaddy to 5.6 from 5.4 native in order
 to use hash_equals function, but it didn't initially contain mysqlnd so I added it, but 
  apparently that's not enough: need to do something to php.ini and also restart server)
$result = $stmt->get_result(); and while loop above

INstead had to use this with php 5.6
$stmt->bind_result($user->hash);
while ($stmt->fetch()) {
	// Hashing the password with its hash as the salt returns the same hash
	file_put_contents("testData.txt", "Got into while loop ");
	file_put_contents("testData.txt", $user->hash, FILE_APPEND);
	if ( hash_equals($user->hash, crypt($password, $user->hash)) ) {
	  // Ok!
		file_put_contents("testData.txt", " success!", FILE_APPEND);
	}
}
*/
?>