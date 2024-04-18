
//let spawn = require('child_process');

//                           -rwxrwxrwx     files       user               group            size       month     day       time   (year)    name
const expression = /([-drwx+@]+)\s+(\d+)\s+([a-zA-Z0-9._-]+)\s+([a-zA-Z0-9._-]+)\s+(\d+)\s+(\w{3})\s+(\d{1,2})\s+(\d{1,2}:\d{1,2}|\d{4})\s+(.+)/

/*spawn.exec('cd .. && ls -l', (err, stdout, stderr) => {
    if (err) {
        console.error(err);
        return;
    }

    let lines = stdout.split('\n').filter( line => line.length > 0 );

    for ( let line of lines )
        parseLine(line);
});*/

parseLine('drwxr-x---  2 gitlab-runner gitlab-runner 4096 Mar  9 00:19 gitlab-runner');

function parseLine(line) {
    let match = line.match(expression);
    if ( match != null ) {
        // Convert to array
        let [_, permissions, files, user, group, size, date, name] = match;
        console.log(
            `Permissions: ${permissions}\tFiles: ${files}\tUser: ${user}\tGroup: ${group}\tSize: ${size}\tDate: ${date}\tName: ${name}\n\n`
        );
    }
    else {
        console.error("Line did not match: ", line);
    }
}