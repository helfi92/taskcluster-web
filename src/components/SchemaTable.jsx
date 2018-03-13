import { PureComponent } from 'react';
import { string } from 'prop-types';
import SchemaViewer from 'react-schema-viewer';
import RefParser from 'json-schema-ref-parser/dist/ref-parser';

export default class SchemaTable extends PureComponent {
  static propTypes = {
    schemaUrl: string.isRequired
  };

  state = {
    schema: null
  };

  async componentWillMount() {
    const schema = await (await fetch(this.props.schemaUrl)).json();

    this.setState({ schema: await RefParser.dereference(schema) });
  }

  render() {
    const { schema } = this.state;

    if (!schema) {
      return null;
    }

    return <SchemaViewer borderColor="#000" schema={schema} />;
  }
}
