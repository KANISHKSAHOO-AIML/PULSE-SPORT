async function test() {
  try {
    const res = await fetch('https://rbjgobolymqzbfxfqidb.supabase.co/rest/v1/?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiamdvYm9seW1xemJmeGZxaWRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTExNTIsImV4cCI6MjA4OTE2NzE1Mn0.SrG6DDrLbVVSVyCTQX2tPnTeHgDlcLdPduDB0oMtmVI');
    console.log("Status:", res.status);
    console.log("Response:", await res.text().then(t => t.slice(0, 100)));
  } catch (err) {
    console.log("Fetch failed exactly with:");
    console.log(err.name, err.message, err.cause ? err.cause.message : 'No cause');
  }
}
test();
