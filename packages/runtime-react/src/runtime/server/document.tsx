import React, { Component, FunctionComponent, useContext } from "react";
import * as Runtime from "@shuvi/types/runtime";
import { DocumentContext, DocumentContextType } from "../../documentContext";

function HtmlTag({ tagName, attrs = {} }: Runtime.HtmlTag) {
  const { innerHtml, ...rest } = attrs;
  if (innerHtml) {
    return React.createElement(tagName, {
      ...rest,
      dangerouslySetInnerHTML: {
        __html: innerHtml
      }
    });
  }

  return React.createElement(tagName, attrs);
}

function Html(props: any) {
  return <html {...props} />;
}

function Tags(tags: Runtime.HtmlTag[]) {
  return (
    <>
      {tags.map((tag, index) => (
        <HtmlTag key={index} {...tag} />
      ))}
    </>
  );
}

function Head() {
  const { documentProps } = useContext(DocumentContext);
  return Tags(documentProps.headTags);
}

function Content() {
  const { documentProps } = useContext(DocumentContext);
  return Tags(documentProps.contentTags);
}

const Scripts: FunctionComponent<any> = () => {
  const { documentProps } = useContext(DocumentContext);
  return Tags(documentProps.scriptTags);
};

export default class Document extends Component<Runtime.DocumentProps> {
  context!: DocumentContextType;

  getContextValue(): DocumentContextType {
    return {
      documentProps: this.props
    };
  }

  render() {
    return (
      <DocumentContext.Provider value={this.getContextValue()}>
        <Html>
          <Head />
          <body>
            <Content />
            <Scripts />
          </body>
        </Html>
      </DocumentContext.Provider>
    );
  }
}
