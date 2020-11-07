import React from "react";
import "../App.css"

class UsersPanel extends React.Component {
  render = () => (
    <div className="user-panel">
      <h2>Online Users</h2>
      {
        this.props.users.map((user, index) => {
          return this.props.currentUser === user.username ? 
            <div className="user" key={index}>{this.props.currentUser} (you)</div> :
            <div className="user" key={index}>{user.username}</div>
          
        }) 
      }
    </div> 
  );
}

export default UsersPanel;