import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Card,
  Button,
  Tooltip,
  Divider,
  Select,
} from 'antd';
import { Terminal } from 'xterm';
import xtermStyle from 'xterm/dist/xterm.css';
import * as routerRedux from 'react-router-redux';

const Option = Select.Option;

let term = new Terminal({
  cursorBlink: true,
  cols: Math.round(document.body.clientWidth / 12),
  rows: 40,
  cursorBlink: 5,
  // scrollback: 30,
  tabStopWidth: 4,
});

// term.textarea = false

class Logs extends PureComponent {
  state = {
    timeoutId: 0,
    container: '',
    style: {
      marginBottom: 24
    },
    btnShrink: "arrows-alt"
  };

  componentDidMount() {
    const { dispatch, match } = this.props;
    let { timeoutId } = this.state;
    dispatch({
      type: 'pods/getLogs',
      payload: {
        namespace: match.params.namespace,
        name: match.params.svc,
        podName: match.params.name,
        container: match.params.svc
      },
    });
    if (timeoutId !== 0) {
      clearInterval(timeoutId);
    }
    term.clear();
    term.open(document.getElementById('xterm-container'));
    timeoutId = setInterval(this.getLogs, 5000);
    this.setState({
      timeoutId: timeoutId,
    });
    window.addEventListener('resize', this.updateDimensions)
  };

  componentWillUnmount() {
    let { timeoutId } = this.state;
    if (timeoutId != 0) {
      clearInterval(timeoutId);
    }
  }

  stopLogSend = (e) => {
    e.preventDefault();
    let { timeoutId } = this.state;
    if (timeoutId != 0) {
      clearInterval(timeoutId);
    }
  };

  getLogs = () => {
    const { dispatch, match } = this.props;
    let { container } = this.state;
    if (container == "") {
      container = match.params.svc;
    }
    dispatch({
      type: 'pods/getLogs',
      payload: {
        namespace: match.params.namespace,
        name: match.params.svc,
        podName: match.params.name,
        container: container,
      },
    });
  };

  downloadLogs = (e) => {
    e.preventDefault();
    const { match } = this.props;
    // /pods/{namespace}/detail/{name}/logs/{podName}/container/{container}/download
    let { container } = this.state;
    if (container == "") {
      container = match.params.svc;
    }
    window.open('/pods/' + match.params.namespace + '/detail/' + match.params.svc + '/logs/' + match.params.name + '/container/'+container+'/download');
  };

  changePod = (value) => {
    const { dispatch, match: { params } } = this.props;
    dispatch(routerRedux.push('/pods/' + params.namespace + '/' + params.svc + '/detail/' + value));
  };
  changeContainer = (value) => {
    this.setState({ container: value });
    const { dispatch, match } = this.props;
    dispatch({
      type: 'pods/getLogs',
      payload: {
        namespace: match.params.namespace,
        name: match.params.svc,
        podName: match.params.name,
        container: value,
      },
    });
  };

  updateDimensions = () => {
    const {btnShrink} = this.state;
    if (btnShrink == "shrink") {
      let cols = parseInt((window.innerWidth - (window.innerWidth / 8 )) / 8);
      let rows = parseInt((window.innerHeight - 15) / (21 - 3.3333)); // 3.3333 = (CardHeaderHeight 70px / 21); 21 = line-height 1.5 * fontSize 14px
      term.resize(cols, rows)
    } else {
      let width = document.body.clientWidth - 305
      let cols = parseInt((width - (width / 8)) / 8 );
      term.resize(cols, 40)
    }
  };

  arrowsAlt = () => {
    const {btnShrink} = this.state;
    let style = {
      marginBottom: 24
    }
    if (btnShrink != "shrink") {
      style = {
        position: "fixed", top:0, left:0, zIndex: 1000, width: "100%", height: window.innerHeight
      }
      this.setState({
        style: style,
        btnShrink: "shrink"
      });
      let cols = parseInt((window.innerWidth - (window.innerWidth / 8 )) / 8);
      let rows = parseInt((window.innerHeight - 15) / (21 - 3.3333)); // 3.3333 = (CardHeaderHeight 70px / 21); 21 = line-height 1.5 * fontSize 14px
      term.resize(cols, rows)
    } else {
      this.setState({
        style: style,
        btnShrink: "arrows-alt"
      });
      let width = document.body.clientWidth - 305
      let cols = parseInt((width - (width / 8)) / 8 );
      // let rows = parseInt((window.innerHeight - 15) / (21 - 3.3333)); // 3.3333 = (CardHeaderHeight 70px / 21); 21 = line-height 1.5 * fontSize 14px
      term.resize(cols, 40)
    }
  };

  render() {
    const { pods: { logs: { logs }, list, detail }, match } = this.props;
    term.clear();
    if (logs && logs.length > 0) {
      for (var i in logs) {
        term.writeln(logs[i].content);
      }
    }
    const optionData = (data) => {
      if (!list) {
        return <Option value={match.params.name}>{match.params.name}</Option>;
      }
      const dataMap = [];
      for (var i in data) {
        dataMap.push(<Option key={i} value={data[i].name}>{data[i].name}</Option>);
      }
      return dataMap;
    };
    const titleContent = (
      <span>
        ??????
        {detail && detail.pod && detail.pod.spec && detail.pod.spec.containers && (
          <Select
            style={{ marginRight: 20, marginLeft: 20, border: false }}
            defaultValue={match.params.svc}
            onChange={(value) => this.changeContainer(value)}
          >
            {optionData(detail.pod.spec.containers)}
          </Select>
        )}
        ??????
        <Select
          style={{ marginLeft: 20, border: false }}
          defaultValue={match.params.name}
          onChange={(value) => this.changePod(value)}
        >
          {optionData(list)}
        </Select>
      </span>
    );

    const {style, btnShrink} = this.state;

    return (
      <Card
        title={titleContent}
        style={style}
        bodyStyle={{ margin: 0, padding: 0}}
        bordered={false}
        extra={
          <div>
            <Tooltip placement="topLeft" title="??????????????????">
              <Button icon="pause-circle" onClick={this.stopLogSend}/>
            </Tooltip>
            <Divider type="vertical"/>
            <Tooltip placement="topLeft" title="??????????????????">
              <Button icon={btnShrink} onClick={this.arrowsAlt}/>
            </Tooltip>
            <Divider type="vertical"/>
            <Tooltip placement="topLeft" title="????????????" onClick={this.downloadLogs}>
              <Button icon="download"/>
            </Tooltip>
          </div>
        }
      >
        <div id="xterm-container" className={xtermStyle.xterm}></div>
      </Card>
    );
  }
}

export default connect(({ pods }) => ({
  pods,
}))(Logs);
