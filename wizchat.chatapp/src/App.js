
import { Col, Container, Row } from 'react-bootstrap';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import WaitingRoom from './components/waitingroom';
import ChatRoom from './components/chatroom';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useState } from 'react';

function App() {
  const [connection, setConnection] = useState();
  const [messages, setMessages] = useState([]);

  const joinChatRoom = async (username, chatroom) => {
    try {
      const connection = new HubConnectionBuilder()
        .withUrl("http://localhost:5188/chat") //адрес, по кот приложение будет подключаться к хабу
        .configureLogging(LogLevel.Information)
        .build();

      connection.on("JoinSpecificChatRoom", (username, msg) => {
        console.log("msg: ", msg);
        setMessages(messages => [...messages, { username, msg }]);
      });

      connection.on("ReceiveSpecificMessage", (username, msg) => {
        console.log("msg:" + msg + " username " + username)
        setMessages(messages => [...messages, { username, msg }]); //добавляем в конец сообщение
      })

      await connection.start();
      await connection.invoke("JoinSpecificChatRoom", { username, chatroom });

      setConnection(connection);

    } catch (e) {
      console.log(e);
    }
  }

  const sendMessage = async (message) => {
    try {
      await connection.invoke("SendMessage", message);
    }
    catch (e) {
      console.log(e);
    }
  }

  return (
    <div >
      <main>
        <Container>
          <Row class='px-5 my-5'>
            <Col sm='12'>
              <h1 className='font-weight-light'>Добро пожаловать в Wiz чат!</h1>
            </Col>
          </Row>
          {!connection
            ? <WaitingRoom joinChatRoom={joinChatRoom}></WaitingRoom>
            : <ChatRoom messages={messages} sendMessage={sendMessage}></ChatRoom>
          }

        </Container>
      </main>
    </div>
  );
}

export default App;
