require('./base-css.js');
require('../css/properties.css');
var React = require('react');
var util = require('./util');
var CopyBtn = require('./copy-btn');
var ExpandCollapse = require('./expand-collapse');
var JSONTree = require('./components/react-json-tree')['default'];

var Properties = React.createClass({
  getInitialState: function () {
    return { viewSource: false };
  },
  toggle: function () {
    this.setState({ viewSource: !this.state.viewSource });
  },
  renderValue: function(val) {
    return val && val.length >= 2100 ? <ExpandCollapse text={val} /> : val;
  },
  render: function () {
    var self = this;
    var props = self.props;
    var sourceText = props.enableViewSource;
    var copyValue = props.enableCopyValue;
    var hasPluginRule = props.hasPluginRule;
    var viewSource = self.state.viewSource;
    var onHelp = props.onHelp;
    var rawName = props.rawName;
    var showJsonView = props.showJsonView;
    var rawValue = props.rawValue;
    var modal = props.modal || {};
    var title = props.title || {};
    var keys = Object.keys(modal);
    if (sourceText || copyValue) {
      var result = [];
      keys.forEach(function (name) {
        if (hasPluginRule && name === 'rule') {
          return;
        }
        var value = modal[name];
        name = sourceText ? name + ': ' : '';
        result.push(
          Array.isArray(value)
            ? value
                .map(function (val) {
                  return name + util.toString(val);
                })
                .join('\n')
            : name + util.toString(value)
        );
      });
      sourceText = sourceText && result.join('\n');
      copyValue = copyValue && result.filter(util.noop).join('\n').trim();
    }
    if (self.textStr !== sourceText) {
      self.textStr = sourceText;
      try {
        self.jsonStr = JSON.stringify(modal, null, '  ');
      } catch (e) {
        self.jsonStr = undefined;
      }
    }

    return (
      <div
        className={
          'w-properties-wrap ' +
          (viewSource
            ? 'w-properties-view-source '
            : 'w-properties-view-parsed ') +
          (props.hide ? 'hide' : '')
        }
      >
        {sourceText ? (
          <div className="w-textarea-bar">
            <CopyBtn value={sourceText} name="AsText" />
            {self.jsonStr ? (
              <CopyBtn value={self.jsonStr} name="AsJSON" />
            ) : undefined}
            <a onClick={self.toggle}>{viewSource ? 'Form' : 'Text'}</a>
          </div>
        ) : undefined}
        {copyValue ? (
          <div className="w-textarea-bar">
            <CopyBtn value={copyValue} name={props.name} />
          </div>
        ) : undefined}
        {sourceText ? (
          <pre className="w-properties-source">
            {self.renderValue(sourceText)}
          </pre>
        ) : undefined}
        <table
          className={
            'table w-properties w-properties-parsed ' + (props.className || '')
          }
        >
          <tbody>
            {rawValue ? (
              <tr key="raw" className={rawValue ? undefined : 'w-no-value'}>
                <th>{rawName}</th>
                <td className="w-prop-raw-data w-user-select-none" title={rawValue}>
                  <pre>
                    {self.renderValue(rawValue)}
                  </pre>
                </td>
              </tr>
            ) : null}
            {keys.map(function (name) {
              var value = modal[name];
              if (Array.isArray(value)) {
                return value.map(function (val, i) {
                  val = util.toString(val);
                  var json = showJsonView && util.likeJson(val) && util.parseJSON(val);
                  return (
                    <tr key={i} className={val ? undefined : 'w-no-value'}>
                      <th>
                        {onHelp ? (
                          <span
                            data-name={name}
                            onClick={onHelp}
                            className="glyphicon glyphicon-question-sign"
                          ></span>
                        ) : undefined}
                        {self.renderValue(name)}
                      </th>
                      <td className={json ? 'w-properties-json' : 'w-user-select-none'}>
                        {
                          json ? <JSONTree data={json}
                            onSearch={function() {
                              util.showJSONDialog(json);
                            }}
                          /> : <pre>{self.renderValue(val)}</pre>
                        }
                      </td>
                    </tr>
                  );
                });
              }
              value = util.toString(value);
              var json = showJsonView && util.likeJson(value) && util.parseJSON(value);
              return (
                <tr
                  key={name}
                  title={title[name]}
                  className={value ? undefined : 'w-no-value'}
                >
                  <th>
                    {onHelp ? (
                      <span
                        data-name={name}
                        onClick={onHelp}
                        className="glyphicon glyphicon-question-sign"
                      ></span>
                    ) : undefined}
                    {self.renderValue(name)}
                  </th>
                  <td className={json ? 'w-properties-json' : 'w-user-select-none'}>
                    {
                      json ? <JSONTree data={json} onSearch={function() {
                        util.showJSONDialog(json);
                      }} /> : <pre>{self.renderValue(value)}</pre>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = Properties;
