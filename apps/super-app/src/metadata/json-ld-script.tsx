type JsonLdScriptProps<T> = Readonly<{
  schema: T;
}>;

export default function JsonLdScript<T>(props: JsonLdScriptProps<T>) {
  const { schema } = props;

  return (
    <script
      type="application/ld+json"
      // oxlint-disable-next-line react/no-danger -- JSON-LD structured data serialized via JSON.stringify, not raw HTML/user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
