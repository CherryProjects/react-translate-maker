import { Component, PropTypes, Children } from 'react';
import Translate from 'translate-maker';

export default class LocaleProvider extends Component {
  static propTypes = {
    children: PropTypes.node,
    locale: PropTypes.string,
    locales: PropTypes.array,
    namespace: PropTypes.string,
    fallbacks: PropTypes.object,
    cache: PropTypes.object,
    adapter: PropTypes.object,
    defaultAdapter: PropTypes.object,
    dotNotation: PropTypes.bool,
    mode: PropTypes.string,
    references: PropTypes.bool,
    variables: PropTypes.bool,
    combinations: PropTypes.bool,
    filters: PropTypes.object,
    controlled: PropTypes.bool,
  };

  static defaultProps = {
    controlled: true,
  };

  static childContextTypes = {
    translate: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    const translate = new Translate(props);

    this.state = {
      translate,
      locale: translate.getLocale(),
    };
  }

  getChildContext() {
    return {
      translate: this,
      t: this.t,
    };
  }

  componentDidMount() {
    const { translate } = this.state;

    translate.on('locale', this.localeChanged);
    translate.on('changed', this.dataChanged);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.controlled) {
      if (newProps.locale) {
        this.state.translate.setLocale(newProps.locale);
      }

      if (newProps.namespace) {
        this.state.translate.load(newProps.namespace);
      }
    }
  }

  componentWillUnmount() {
    const { translate } = this.state;

    translate.removeListener('locale', this.localeChanged);
    translate.removeListener('changed', this.dataChanged);
  }

  get(path, attrs, defaultValue) {
    const { translate } = this.state;
    return translate.get(path, attrs, defaultValue);
  }

  set(path, value) {
    const { translate } = this.state;
    return translate.set(path, value);
  }

  getLocale() {
    return this.state.translate.getOptions().locale;
  }

  setLocale(locale, callback) {
    if (this.props.controlled) {
      return callback(new Error('LocaleProvider is set as controlled component. If you want to use setLocale please set controlled = false'));
    }

    return this.state.translate.setLocale(locale, (...args) => {
      callback(...args);
    });
  }

  t = (path, attrs, defaultValue) => {
    return this.get(path, attrs, defaultValue);
  }

  dataChanged = () => {
    this.forceUpdate();
  }

  localeChanged = (locale) => {
    this.setState({ locale });
  }

  render() {
    return Children.only(this.props.children);
  }
}
