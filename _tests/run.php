<?php
$file = $argv[1]; $body = $argv[2] ?? null;
class FakeInput { public $context; private $pos=0; static $data='';
  function stream_open($p,$m,$o,&$op){return true;} function stream_read($n){$r=substr(self::$data,$this->pos,$n);$this->pos+=strlen($r);return $r;}
  function stream_eof(){return $this->pos>=strlen(self::$data);} function stream_stat(){return [];} }
if ($body !== null) { FakeInput::$data = $body; stream_wrapper_unregister('php'); stream_wrapper_register('php','FakeInput'); }
session_start();
$_SESSION['library_user'] = ['user_id'=>1,'role'=>'admin','name'=>'Himel','email'=>'himel@gmail.com'];
$_SERVER['REQUEST_METHOD'] = $body === null ? 'GET' : 'POST';
require '/home/claude/library_management_system_final/AdminPHP/'.$file;
