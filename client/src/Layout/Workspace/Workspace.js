import React from 'react';
import classes from './workspace.css';
import { withRouter } from 'react-router-dom';
import { CurrentMembers, Button, ReplayerControls }from '../../Components';
import GgbGraph from '../../Containers/Workspace/GgbGraph';
import DesmosGraph from '../../Containers/Workspace/DesmosGraph';
import GgbReplayer from '../../Containers/Replayer/GgbReplayer';
import DesmosReplayer from '../../Containers/Replayer/DesmosReplayer';
import ChatReplayer from '../../Containers/Replayer/ChatReplayer';
import Chat from '../../Containers/Workspace/Chat';

const workspaceLayout = ({
  room, user, socket,
  resetControlTimer, inControl, toggleControl, 
  replayer, activeMember, temp, 
  save, someoneElseInControl,
  instructions, history, saved, updateRoom, updatedRoom,
}) => {
  let controlText = 'Take Control';
  if (inControl) controlText = 'Release Control';
  else if (someoneElseInControl) controlText = 'Request Control';
  return (
    <div className={classes.PageContainer}>
      <div className={classes.Container}>
        <div className={classes.WorkspaceTabs}>
          <div className={[classes.Tab, classes.Active].join(" ")}><div className={classes.TabBox}>Tab 1</div></div>
          <div className={classes.Tab}><div className={classes.TabBox}><i className="fas fa-plus"></i></div></div>
        </div>
        <div className={classes.Top}>
          <div className={[classes.Graph, classes.Left, "graph"].join(" ")}>
            {replayer ? 
              (room.roomType === 'geogebra' ?
                <GgbReplayer log={replayer.log} index={replayer.index} skipping={replayer.skipping} reset={replayer.reset}/> :
                <DesmosReplayer />
              ):   
              (room.roomType === 'geogebra' ? 
                <GgbGraph room={room} socket={socket} user={user} updateRoom={updateRoom} inControl={inControl} resetControlTimer={resetControlTimer}/> :
                <DesmosGraph  room={room} socket={socket} user={user} inControl={inControl} resetControlTimer={resetControlTimer}/>
              )
            }
          </div>
          <div className={classes.Right}>
            <div className={classes.Chat}>
              {replayer ? 
                <ChatReplayer roomId={room._id} log={replayer.log} index={replayer.index} skipping={replayer.skipping} reset={replayer.reset} setCurrentMembers={replayer.setCurrentMembers} /> : 
                <Chat roomId={room._id} messages={room.chat || []} socket={socket} user={user} updatedRoom={updatedRoom} />
              }
            </div>
            <div className={classes.Members}>
              <CurrentMembers members={room.currentMembers.map(member => member.user)} activeMember={activeMember}/>
            </div>
          </div>
        </div>
        <div className={classes.Bottom}>
          <div className={classes.Left}>
          {replayer ? 
            <ReplayerControls {...replayer} /> : 
            <div className={classes.RoomDescription}>
              <h3 className={classes.InstructionsTitle}>Instructions</h3>
              <div className={classes.Instructions}>{temp ? `Share this url to invite others: ${window.location}` : instructions}</div>
            </div>
          }
          {temp && !saved ? 
            <div>
              <Button theme={'Small'} data-testid='save-temp' style={{zIndex: 1000}} m={20} click={save}>Save This Workspace</Button>
            </div> : null 
          }
          </div>
          <div className={classes.Right}>
            <div className={classes.ReferenceWindow}>
              {/* <div className={classes.ReferenceControls} onClick={toggleReference}>
                <i className={["fas", "fa-mouse-pointer", classes.MousePointer].join(" ")}></i>
                <div>Reference </div>
              </div> */}
              <div className={classes.ReferenceDescription}>

              </div>
            </div>
            <div className={classes.Controls}>
              {!replayer ? 
                <div className={classes.SideButton} onClick={toggleControl}>{controlText}</div> : 
                <div className={classes.SideButton}>Make A Comment</div>
              }
              <div className={[classes.SideButton, classes.Exit].join(" ")} onClick={() => {temp ? history.push('/') : history.goBack()}} theme={'Small'} data-testid='exit-room'>Exit Room</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default withRouter(workspaceLayout);