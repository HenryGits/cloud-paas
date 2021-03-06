import React from 'react';
import { connect } from 'dva';
import {
  Form,
  Input,
  Button,
  Checkbox,
  Modal,
  Select,
  Radio,
  InputNumber,
  message,
  Tooltip,
  Icon,
  Divider,
} from 'antd';
import { routerRedux } from 'dva/router';
import styles from './style.less';

const { Option } = Select;
const confirm = Modal.confirm;
const formItemLayout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 19,
  },
};

@Form.create()
class Step2 extends React.PureComponent {
  state = {
    portNum: 1,
    gitType: 'tag',
    gitPath: '',
    gitVersioin: '',
    addPort: false,
    jarCommand: `java`,
    tomcatCommand: `/bin/sh,/opt/soft/tomcat/bin/catalina.sh,run`,
  };

  componentWillMount() {
    const { match: { params: { namespace, name } }, dispatch } = this.props;
    dispatch({
      type: 'project/projectInfo',
      payload: {
        namespace: namespace,
        name: name,
      },
    });
    dispatch({
      type: 'global/config',
    });
  }

  onChangeImage = val => {
    this.props.dispatch({
      type: 'project/changeProjectImage',
      payload: {
        image: val,
      },
    });
    this.props.dispatch({
      type: 'project/changeImageLanguage',
      payload: { image: val },
    });
  };


  onDownDockerfile = () => {
    this.props.dispatch(routerRedux.push('/markets/dockerfile/list'));
  };

  changeCpuType = (e) => {
    if (this.props.data.javaState) {
      const halfNum = parseInt(e.target.value.substring(2), 0) / 2;
      if (halfNum >= 1 && halfNum <= 20) {
        this.props.dispatch({
          type: 'project/changeCupInfo',
          payload: {
            cpuHalfNum: halfNum.toString() + 'g',
          },
        });
      } else if (halfNum === 0.5) {
        this.props.dispatch({
          type: 'project/changeCupInfo',
          payload: {
            cpuHalfNum: '512m',
          },
        });
      } else if (halfNum > 20) {
        this.props.dispatch({
          type: 'project/changeCupInfo',
          payload: {
            cpuHalfNum: halfNum.toString() + 'm',
          },
        });
      }
    }
  };

  changeGitType = e => {
    const { dispatch, gitAddrType } = this.props;
    var gitType = e.target.value;
    const { gitPath } = this.state;
    if (gitPath === '') {
      return;
    }
    this.setState({ gitType: gitType });
    if (gitType === 'branch') {
      dispatch({
        type: 'gitlab/branchList',
        payload: {
          git: gitAddrType + gitPath,
        },
      });
    } else if (gitType === 'tag') {
      dispatch({
        type: 'gitlab/tagList',
        payload: {
          git: gitAddrType + gitPath,
        },
      });
    }
  };

  changeGitVersion = val => {
    this.setState({ gitVersioin: val });
  };
  changeServiceStart = (e) => {
    this.props.dispatch({
      type: 'project/changeServiceStart',
      payload: {
        serviceStart: parseInt(e.target.value),
      },
    });

  };

  fetchGitlab = e => {
    var val = e.target.value;
    if (val == '') {
      return;
    }
    if (val.indexOf('git@git') !== -1) {
      message.error('???????????????????????????????????????????????????????????????');
      return;
    }
    this.setState({
      gitPath: val,
    });
    const { dispatch, gitAddrType } = this.props;
    const { gitType } = this.state;
    if (gitType === 'branch') {
      dispatch({
        type: 'gitlab/branchList',
        payload: {
          git: gitAddrType + val,
        },
      });
    } else if (gitType === 'tag') {
      dispatch({
        type: 'gitlab/tagList',
        payload: {
          git: gitAddrType + val,
        },
      });
    }
  };

  render() {
    const { form, data, dispatch, submitting, match, gitlab, gitAddrType } = this.props;
    const { deploymentInfo, language } = data;
    const { WebFields } = deploymentInfo;
    const { getFieldDecorator, validateFields } = form;
    var { list } = gitlab;
    if (this.state.gitType === 'tag' && gitlab && gitlab.tags) {
      list = gitlab.tags;
    }
    if (this.state.gitType === 'branch' && gitlab && gitlab.branches) {
      list = gitlab.branches;
    }
    const onPrev = () => {
      dispatch(routerRedux.push('/project/create/info'));
    };
    const addPorts = () => {
      const { portNum } = this.state;
      if (portNum >= 5) {
        Modal.warning({
          title: '????????????~',
          content: '??????????????????????????????????????????????????????????????????~',
        });
        return;
      }
      this.setState({
        portNum: portNum + 1,
      });
      onValidateForm(true);
    };
    const onValidateForm = (auto) => {
      validateFields((err, values) => {
        var params = [];
        var routes = [];
        if (this.state.addPort) {
          for (var i = 1; i <= values.routes.length; i++) {
            if (values.routes[i] && values.routes[i]['port'] && values.routes[i]['name'] && values.routes[i]['protocol']) {
              routes.push(values.routes[i]);
            }
          }
        }

        if (values['git_addr'].indexOf('git@git') !== -1) {
          message.error('???????????????????????????????????????????????????????????????');
          return;
        }
        var commandData = [];
        var argsData = [];
        if (data.javaState) {
          if (data.serviceStart === '2') {
            this.state.tomcatCommand.split(',').map((value) => {
              if (value !== '') {
                commandData.push(value);
              }
            });
          } else {
            this.state.jarCommand.split(',').map((value) => {
              if (value !== '') {
                commandData.push(value);
              }
            });
          }
        }
        // if (values && values['command'] && values['command'].length > 0) {
        //   values['command'].split(',').map((value) => {
        //     if (value) {
        //       commandData.push(value);
        //     }
        //   });
        // }
        if (values && values['args'] && values['args'].length > 0) {
          values['args'].split(',').map((value) => {
            if (value) {
              argsData.push(value);
            }
          });
        } else if (values && values['env'] && values['env'].length > 0) {
          values['env'].split(' ').map((value) => {
            if (value) {
              argsData.push(value);
            }
          });
        }

        // params.id = match.params.projectId;
        params.name = match.params.name;
        params.namespace = match.params.namespace;
        params.step = 1;
        params.ports = routes;
        params.replicas = values.replicas ? values.replicas : 1; // ?????????
        params.resource_type = '1'; // ????????????: 1?????????????????????2??????????????????
        params.resources = values.resources; // ????????????
        // params.other_resources = values["other_resources"]; //?????????????????????
        params.mountPath = values.mountPath ? values.mountPath : ''; // ?????????????????????
        params.image = values.image; // ????????????
        params.git_addr = values.git_addr;
        params.git_type = values.git_type;
        params.git_version = values.git_version;
        params.args = argsData;
        params.command = commandData;
        params.resource_model = values.mesh ? values.mesh : 'normal';
        params.double_service = doubleService;
        params.service_start = values.service_start;
        // params.env = values.env;
        params.git_pomfile = values.git_pomfile;
        params.language = language ? language : 'Golang';
        params.git_buildpath = values.git_buildpath;
        params.buildmore = '1';
        if (!params.git_version) {
          params.git_version = this.state.gitVersioin;
        }
        if (!params.git_type) {
          params.git_type = 'tag';
        }


        let addPorts = true;
        let doubleService = values.doubleService;
        let portsData = [];
        for (var i = 0; i < params.ports.length; i++) {
          if (portsData && portsData.indexOf(params.ports[i]['port']) !== -1) {
            message.error('?????????' + params.ports[i]['port'] + ' ????????????');
            return;
          }
          portsData.push(params.ports[i]['port']);
          if (params.ports[i]['port'] === 20880) {
            doubleService = false;
          }
        }
        if (!this.state.addPort) {
          params.ports.push({ port: 8080, protocol: 'TCP', name: 'http-8080' });
        }
        if (data.javaState && doubleService) {
          params.ports.push({ port: 20880, protocol: 'TCP', name: 'dubbo-port' });
        }
        // if (auto === true) {
        //   dispatch({
        //     type: 'project/projectBasicAutoSave',
        //     payload: params,
        //   });
        //   return;
        // }
        if (!err) {
          // if (params.resource_type == '1') {
          confirm({
            title: '??????????????????????',
            content: '?????????????????????????????????????????????????????????',
            onOk() {
              return new Promise((resolve, reject) => {
                setTimeout(Math.random() > 0.5 ? resolve : reject, 300);
                dispatch({
                  type: 'project/projectBasicStep',
                  payload: params,
                });
              }).catch(() => console.log('Oops errors!'));
            },
            onCancel() {
            },
          });
          // } else {
          //   dispatch({
          //     type: 'project/projectBasicStep',
          //     payload: params,
          //   });
          // }
        } else {
          message.error('????????????~');
        }
        // dispatch(routerRedux.push("/project/create/rule/" + match.params.projectId));
      });
    };

    var items = [];
    const portsLength = this.state.portNum + (WebFields ? WebFields.ports.length : 0);
    for (var i = 1; i <= portsLength; i++) {
      if (i === 1) {
        items.push(
          <div key={i}>
            {getFieldDecorator(`routes[${i}]["port"]`, {
              initialValue: WebFields ? (WebFields.ports[i - 1] ? WebFields.ports[i - 1]['port'] : '8080') : data.image === 'nginx' || data.image === 'static' ? 80 : 8080,
              // rules: [{required: false, message: "??????????????????80???65535??????" }],
            })(
              <InputNumber
                style={{ width: '150px' }}
                placeholder="??????: 80 ~ 65535??????"
                min={80}
                max={65535}
              />,
            )}
            &nbsp;
            {getFieldDecorator(`routes[${i}]["protocol"]`, {
              initialValue: WebFields ? (WebFields.ports[i - 1] ? WebFields.ports[i - 1]['protocol'] : 'TCP') : 'TCP',
            })(
              <Select placeholder="TCP" style={{ width: '80px' }}>
                <Option value="TCP">TCP</Option>
                <Option value="UDP">UDP</Option>
              </Select>,
            )}
            &nbsp;
            {getFieldDecorator(`routes[${i}]["name"]`, {
              initialValue: WebFields ? (WebFields.ports[i - 1] ? WebFields.ports[i - 1]['name'] : 'http-8080') : data.image === 'nginx' || data.image === 'static' ? 'http-80' : 'http-80',
            })(
              <Input placeholder="????????????: http/grpc" style={{ width: '120px' }} onBlur={() => onValidateForm(true)}/>,
            )}
            &nbsp;&nbsp;
            <Button onClick={addPorts} icon="file-add"/>
          </div>,
        );
      } else {
        items.push(
          <div key={i}>
            {getFieldDecorator(`routes[${i}]["port"]`, {
              initialValue: WebFields ? (WebFields.ports[i - 1] ? WebFields.ports[i - 1]['port'] : '') : '',
              // rules: [{required: false, message: "??????????????????80???65535??????" }],
            })(
              <InputNumber
                style={{ width: '150px' }}
                placeholder="??????: 80 ~ 65535??????"
                min={80}
                max={65535}
              />,
            )}
            &nbsp;
            {getFieldDecorator(`routes[${i}]["protocol"]`, {
              initialValue: WebFields ? (WebFields.ports[i - 1] ? WebFields.ports[i - 1]['protocol'] : '') : '',
            })(
              <Select placeholder="TCP" style={{ width: '80px' }}>
                <Option value="TCP">TCP</Option>
                <Option value="UDP">UDP</Option>
              </Select>,
            )}
            &nbsp;
            {getFieldDecorator(`routes[${i}]["name"]`, {
              initialValue: WebFields ? (WebFields.ports[i - 1] ? WebFields.ports[i - 1]['name'] : '') : '',
            })(
              <Input placeholder="????????????: http/grpc" style={{ width: '120px' }} onBlur={() => onValidateForm(true)}/>,
            )}
            &nbsp;&nbsp;
            <Button onClick={addPorts} icon="file-add"/>
          </div>,
        );
      }
    }

    return (
      <Form layout="horizontal" className={styles.stepForm}>
        <Form.Item {...formItemLayout} label="????????????">
          {getFieldDecorator('image', {
            initialValue: (data && data.image) ? data.image : 'golang',
            rules: [{ message: '?????????????????????', required: true }],
          })(
            <span>
            <Select
              placeholder="golang"
              style={{ width: 320 }}
              name="image"
              value={data.image ? data.image : 'golang'}
              onChange={this.onChangeImage}
            >
              {/*<Option value="alpine:v0.0.02">Golang: alpine:v0.0.02</Option>*/}
              <Option value="golang">
                Golang
              </Option>
              <Option value="java">Java</Option>
              <Option value="nodejs">
                NodeJs
              </Option>
              <Option value="python">
                Python
              </Option>
              <Option value="nginx">
                Nginx
              </Option>
              <Option value="static">
                Static
              </Option>
            </Select>
              &nbsp;&nbsp;
              <Tooltip placement="topLeft" title={language ? language : 'Golang'} arrowPointAtCenter>
                <Button>{language ? language : 'Golang'}</Button>
              </Tooltip>
              &nbsp;&nbsp;
              <Tooltip placement="topLeft" title="???????????????Dockerfile" arrowPointAtCenter>
            <Button icon="cloud-download" onClick={this.onDownDockerfile}/>
            </Tooltip>
            </span>,
          )}
        </Form.Item>
        <Form.Item {...formItemLayout} label="??????Git??????">
          {getFieldDecorator('git_addr', {
            initialValue: WebFields ? WebFields.git_addr : '',
            rules: [{ message: '???????????????Git??????', required: true }],
          })(
            <Input
              placeholder={`????????????(kplcloud/hello.git)`}
              name="git_addr"
              addonBefore={gitAddrType}
              onBlur={this.fetchGitlab}
            />,
          )}
          ??????: &nbsp;
          {getFieldDecorator('git_type', {
            initialValue: WebFields ? WebFields.git_type : 'tag',
          })(
            <Radio.Group onChange={this.changeGitType} name="git_type">
              <Radio value="tag">Tag</Radio>
              {/* <Radio value="branch">Branch</Radio> */}
            </Radio.Group>,
          )}
          ??????: &nbsp;
          {getFieldDecorator('git_version', {
            initialValue: WebFields ? WebFields.git_version : '',
            rules: [{ message: '???????????????', required: true }],
          })(
            <Select style={{ width: 240 }} name="git_version" onChange={this.changeGitVersion} showSearch
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
              {list &&
              list.length &&
              list.map((item, key) => (
                <Option value={item} key={key}>
                  {item}
                </Option>
              ))}
            </Select>,
          )}
          {data.javaState && (
            <span>
                POMFILE: &nbsp;
              {getFieldDecorator('git_pomfile', {
                initialValue: WebFields ? WebFields.git_pomfile : 'pom.xml',
              })(
                <Input
                  placeholder="pomfile:pom.xml"
                  name="git_addr"
                  onBlur={this.fetchGitlab}
                  style={{ width: '85%' }}
                />,
              )}
              </span>
          )}
          <div>
            <Tooltip title="?????????Dockerfile?????? ???: ./ ??? ./docker/ ??????????????????????????????">
              <Icon type="info-circle-o"/>???????????????&nbsp;
            </Tooltip>
            {getFieldDecorator('git_buildpath', {
              initialValue: WebFields ? WebFields.git_buildpath : '',
            })(
              <Input
                placeholder="Dockerfile?????? ???: ./ ??? ./docker ??????????????????????????????"
                name="git_buildpath"
                style={{ width: '80%' }}
                onBlur={() => onValidateForm(true)}
              />,
            )}
          </div>

        </Form.Item>
        {/*{(!language || language === 'Golang') && (*/}
        {/*<Form.Item {...formItemLayout} label={*/}
        {/*<Tooltip title="?????????????????????dockerfile???????????????????????????">*/}
        {/*<Icon type="info-circle-o"/>????????????*/}
        {/*</Tooltip>*/}
        {/*}>*/}
        {/*{getFieldDecorator('buildmore', {*/}
        {/*initialValue: WebFields ? WebFields.buildmore : '1',*/}
        {/*})(*/}
        {/*<Radio.Group>*/}
        {/*<Radio value="2"><Tooltip title="??????Golang1.10??????????????????"><Icon*/}
        {/*type="info-circle-o"/>???</Tooltip></Radio>*/}
        {/*<Radio value="1"><Tooltip title="??????Golang1.11.1??????????????????"><Icon*/}
        {/*type="info-circle-o"/>???</Tooltip></Radio>*/}
        {/*</Radio.Group>,*/}
        {/*)}*/}
        {/*</Form.Item>*/}
        {/*)}*/}
        {data.image !== 'nginx' && data.image !== 'static' && (
          <Form.Item {...formItemLayout} label="????????????" help="?????????????????????">
            {getFieldDecorator('replicas', {
              initialValue: WebFields ? WebFields.replicas : 1,
              rules: [{ required: true, message: '?????????????????????' }],
            })(
              <Select placeholder={1}>
                <Option value={1}>1</Option>
                <Option value={2}>2</Option>
                <Option value={3}>3</Option>
                <Option value={4}>4</Option>
                <Option value={5}>5</Option>
                <Option value={6}>6</Option>
                <Option value={7}>7</Option>
                <Option value={8}>8</Option>
              </Select>,
            )}
          </Form.Item>)}

        <Form.Item
          {...formItemLayout}
          label="????????????"
          help="???????????????????????? (CPU:200m/500m/1/2,??????:256Mi/512Mi/2Gi)"
        >
          <div>
            {data.javaState ? getFieldDecorator('resources', {
              initialValue: WebFields ? ((parseInt(WebFields.resources.substring(2)) / 2) < 1 ? '' : WebFields.resources) : '',
              rules: [{ required: true, message: '?????????????????????' }],
            })(
              <Radio.Group onChange={this.changeCpuType}>
                <Radio value="1/512Mi">512M??????</Radio>
                <Radio value="1/1Gi">1G??????</Radio>
                <Radio value="2/2Gi">2G??????</Radio>
                <Radio value="2/4Gi">4G??????</Radio>
                <Radio value="2/6Gi">6G??????</Radio>
                <Radio value="2/8Gi">8G??????</Radio>
                <Radio value="2/10Gi">10G??????</Radio>
              </Radio.Group>,
            ) : getFieldDecorator('resources', {
              initialValue: WebFields ? WebFields.resources : '',
              rules: [{ required: true, message: '?????????????????????' }],
            })(
              <Radio.Group onChange={this.changeCpuType}>
                <Radio value="100m/64Mi">64M??????</Radio>
                <Radio value="100m/128Mi">128M??????</Radio>
                <Radio value="200m/256Mi">256M??????</Radio>
                <Radio value="500m/512Mi">512M??????</Radio>
                <Radio value="1/1Gi">1G??????</Radio>
                <Radio value="2/2Gi">2G??????</Radio>
                <Radio value="2/4Gi">4G??????</Radio>
                <Radio value="2/6Gi">6G??????</Radio>
                <Radio value="2/8Gi">8G??????</Radio>
              </Radio.Group>,
            )}
            {/*<Form.Item {...formItemLayout} label="??????">*/}
            {/*{getFieldDecorator("other_resources", {*/}
            {/*initialValue: data.project_name,*/}
            {/*rules: [*/}
            {/*{*/}
            {/*pattern: `^([1-9]{1}[0-9]{2}[m]{1}|[0-9]{1})/{1}[1-9]{1}([0-9]{2}Mi|Gi)$`,*/}
            {/*message: "???????????????????????????????????????:200m/500Mi ??? 1/2Gi",*/}
            {/*},*/}
            {/*],*/}
            {/*})(<Input placeholder="??????: 200m/500Mi ??? 1/2Gi"/>)}*/}
            {/*</Form.Item>*/}
          </div>
        </Form.Item>

        {/*<Form.Item*/}
        {/*{...formItemLayout}*/}
        {/*label={*/}
        {/*<Tooltip title="???????????????????????????????????? xxx.idc ??????????????????????????????">*/}
        {/*<Icon type="info-circle-o"/>????????????*/}
        {/*</Tooltip>*/}
        {/*}*/}
        {/*help=""*/}
        {/*>*/}
        {/*{getFieldDecorator('resource_type', {*/}
        {/*initialValue: WebFields ? WebFields.resource_type : '2',*/}
        {/*rules: [{ required: true, message: '??????????????????' }],*/}
        {/*})(*/}
        {/*<Radio.Group onChange={() => onValidateForm(true)}>*/}
        {/*<Radio value="1"><Tooltip*/}
        {/*title="?????????????????????: ?????????????????????????????????:hello.operations:8080?????????????????????????????????????????????????????????????????????????????????????????????????????????"><Icon*/}
        {/*type="info-circle-o"/>?????????????????????</Tooltip></Radio>*/}
        {/*<Radio value="2"><Tooltip title="????????????????????????????????????????????????????????????????????????????????????????????????"><Icon*/}
        {/*type="info-circle-o"/>????????????????????????</Tooltip></Radio>*/}
        {/*</Radio.Group>,*/}
        {/*)}*/}
        {/*</Form.Item>*/}

        {/* <Form.Item
          {...formItemLayout}
          label="??????"
        >
          {getFieldDecorator('resource_model', {
            initialValue: WebFields ? WebFields.resource_model : '2',
            rules: [{ required: true, message: '??????????????????' }],
          })(
            <Radio.Group onChange={() => onValidateForm(true)}>
              <Radio value="1"><Tooltip title="????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????"><Icon
                type="info-circle-o"/>Service Mesh</Tooltip></Radio>
              <Radio value="2"><Tooltip title="???????????????ServiceMesh??????????????????????????????"><Icon
                type="info-circle-o"/>Normal</Tooltip></Radio>
            </Radio.Group>,
          )}
        </Form.Item> */}

        {data.javaState && (<Form.Item
          {...formItemLayout}
          label="????????????"
        >
          {getFieldDecorator('service_start', {
            initialValue: WebFields ? WebFields.service_start : '1',
            rules: [{ required: true, message: '????????????????????????' }],
          })(
            <Radio.Group onChange={this.changeServiceStart}>
              <Radio value="1"><Tooltip title="jar????????????"><Icon
                type="info-circle-o"/>Jar</Tooltip></Radio>
              <Radio value="2"><Tooltip title="Tomcat????????????"><Icon
                type="info-circle-o"/>Tomcat</Tooltip></Radio>
            </Radio.Group>,
          )}
        </Form.Item>)}

        {/*{data.javaState && (*/}
        {/*<Form.Item*/}
        {/*{...formItemLayout}*/}
        {/*label={*/}
        {/*<Tooltip title="??????command?????????????????????">*/}
        {/*<Icon type="info-circle-o"/>command*/}
        {/*</Tooltip>*/}
        {/*}*/}
        {/*>*/}
        {/*{getFieldDecorator('command', {*/}
        {/*initialValue: data.serviceStart === '1' ? `"java"` : `"/bin/sh","/opt/soft/tomcat/bin/catalina.sh","run"`,*/}
        {/*})(<Input placeholder="??????command?????????????????????" onBlur={() => onValidateForm(true)}/>)}*/}
        {/*</Form.Item>*/}
        {/*)}*/}

        {data.javaState && data.serviceStart !== 1 && (
          <Form.Item
            {...formItemLayout}
            label={
              <Tooltip
                title="??????env?????????????????????">
                <Icon type="info-circle-o"/>env
              </Tooltip>
            }
            help="?????????????????????????????????????????????????????? ??????"
          >
            {getFieldDecorator('env', {
              initialValue: `-server -Xms${data.cpuHalfNum} -Xmx${data.cpuHalfNum} -Xmn128m -Xss1024K -XX:PermSize=256m -XX:MaxPermSize=512m -XX:ParallelGCThreads=4 -XX:+UseConcMarkSweepGC -XX:+UseParNewGC -XX:+UseCMSCompactAtFullCollection -XX:SurvivorRatio=6 -XX:MaxTenuringThreshold=10 -XX:CMSInitiatingOccupancyFraction=80`,
              rules: [{
                pattern: '^[^\u4e00-\u9fa5]+$',
                message: '????????????????????????',
              }],
            })(<Input.TextArea placeholder="??????env?????????????????????" style={{ height: 100 }}
                               onBlur={() => onValidateForm(true)}/>)}
          </Form.Item>
        )}

        {data.javaState && data.serviceStart === 1 && (
          <Form.Item
            {...formItemLayout}
            label={
              <Tooltip
                title='??????args?????????????????????,?????????-jar, /usr/local/eureka.jar,--server.port=8000'>
                <Icon type="info-circle-o"/>args
              </Tooltip>
            }
            help="??????????????????????????????????????????????????????,??????"
          >
            {getFieldDecorator('args', {
              initialValue: `-jar,-Xms${data.cpuHalfNum},-Xmx${data.cpuHalfNum},-XX:MaxGCPauseMillis=50,-XX:MetaspaceSize=128m,-XX:MaxMetaspaceSize=256m,-XX:+UseG1GC,-XX:+UseStringDeduplication,-XX:StringDeduplicationAgeThreshold=8,`,
              rules: [{
                pattern: '^[^\u4e00-\u9fa5]+$',
                message: '????????????????????????',
              }],
            })(<Input.TextArea placeholder="??????args?????????????????????" style={{ height: 100 }}
                               onBlur={() => onValidateForm(true)}/>)}
          </Form.Item>
        )}

        {data.javaState && (
          <Form.Item
            {...formItemLayout}
            label="dubbo??????"
          >
            {getFieldDecorator('doubleService', {
              initialValue: false,
              rules: [{ required: true, message: '??????????????????' }],
            })(
              <Checkbox>???</Checkbox>,
            )}
          </Form.Item>
        )}
        {!this.state.addPort && (
          <Divider>
            <Button
              type="primary"
              size="small"
              onClick={() => {
                this.setState({ addPort: true });
              }}
              ghost
              icon="plus-circle"
            >????????????</Button>
          </Divider>
        )}
        {this.state.addPort && (
          <Form.Item
            {...formItemLayout}
            label={
              <Tooltip title="???????????????????????????Service?????????????????????">
                <Icon type="info-circle-o"/>???????????????
              </Tooltip>
            }
            help="???????????????????????????????????????????????????????????????????????????????????????????????????"
          >
            {items}
          </Form.Item>
        )}

        {/* <Form.Item
          {...formItemLayout}
          label={
            <Tooltip title="???????????????????????????????????????????????????????????????.log??????????????????????????????????????????ES">
              <Icon type="info-circle-o"/>????????????
            </Tooltip>
          }
          help="??????????????????????????????????????????????????????????????????.log?????????????????????????????? ?????????/var/log/"
        >
          {getFieldDecorator('mountPath', {
            initialValue: data.project_name,
            rules: [{ message: '????????????????????????????????????' }],
          })(<Input placeholder="????????????????????????????????????: /var/log" onBlur={() => onValidateForm(true)}/>)}
        </Form.Item> */}

        <Form.Item
          style={{ marginBottom: 8 }}
          wrapperCol={{
            xs: { span: 24, offset: 0 },
            sm: {
              span: formItemLayout.wrapperCol.span,
              offset: formItemLayout.labelCol.span,
            },
          }}
          label=""
        >
          <Button onClick={onPrev}>?????????</Button>
          <Button
            type="primary"
            onClick={() => onValidateForm(false)}
            loading={submitting}
            style={{ marginLeft: 8 }}
          >
            ??????
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export default connect(({ project, loading, gitlab, global }) => ({
  submitting: loading.effects['form/submitStepForm'],
  data: project,
  gitlab,
  gitAddrType: global.gitAddrType,
}))(Step2);
