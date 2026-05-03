import { Redirect } from 'expo-router';

export default function CreateTabRedirect() {
  return <Redirect href="/(tabs)/tasks?create=1" />;
}
