import React,{useState,useRef} from 'react'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import {db} from '../../firebase'
import {auth} from '../../firebase'
import {useAuthState} from 'react-firebase-hooks/auth'
import {useCollectionData} from 'react-firebase-hooks/firestore'
import { useSession } from '../../firebase/UserProvider'






function SuperChat() {
    //get current user
    const [user] = useAuthState(auth)
    console.log(user)
    //used for scroll effect
    const dummy = useRef();
    //get messages from db
    const messagesRef = db.collection('messages');
    //query a list of messages order it by time created and limit the list to 25
    const query = messagesRef.orderBy('createdAt').limit(25);
  //gives acess to use collection data
    const [messages] = useCollectionData(query, { idField: 'id' });
  //used for the form to add message
    const [formValue, setFormValue] = useState('');
  
  
    const sendMessage = async (e) => {
      e.preventDefault();
  //gets the id and photo from the current user
      const { uid, photoURL } = auth.currentUser;
  //add  text, timestamp,id,and user photo to databass
      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
      })
  //sets form to empty string after submit
      setFormValue('');
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    }
  
    return (<>
    <h1>Bright Chat</h1>
      <main>
  
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
  
        <span ref={dummy}></span>
  
      </main>
  
      <form onSubmit={sendMessage}>
  
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />
  
        <button type="submit" disabled={!formValue}>💡</button>
  
      </form>
    </>)
  }
function ChatMessage(props){
    //response from the database
    const { text, uid, photoURL } = props.message;
//adds a class to weather the message was sent or received
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
        {/* either the users photo or a picture of a lightbulb */}
      <img src={photoURL || '/lightbulb.png'} /> 
      <p>{auth.currentUser.email}</p>
      <p>{text}</p>
    </div>
  </>)
}
    

    
    

export default SuperChat


