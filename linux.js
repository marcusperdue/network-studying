(function () {
  'use strict';
  const missions = [
    {
      id: 'linux-link', title: '01 · The silent NIC', topic: 'Physical link', level: 'Foundation',
      brief: 'A freshly installed server cannot reach its rack gateway, 10.20.30.1. The intended interface is eno1. Establish whether the link is ready before escalating.',
      tasks: [{ key: 'link', label: 'Inspect interface link state' }, { key: 'ping', label: 'Test gateway reachability' }],
      hints: ['Start with ip link show eno1.', 'Try ping -c 3 10.20.30.1. UP is administrative state; LOWER_UP indicates carrier.'],
      question: 'Which next action best matches the evidence?',
      answers: ['Change the DNS resolver.', 'Check the patch cable, optics, and switch-port status against the cabling plan.', 'Reboot all servers in the rack.', 'Add a second default route.'], correct: 1,
      explanation: 'eno1 is administratively UP but reports NO-CARRIER and state DOWN. Validate the physical path and switch port with the network team. This supports a link problem; it does not identify a specific failed cable or optic.'
    },
    {
      id: 'linux-address', title: '02 · Wrong neighborhood', topic: 'IP addressing', level: 'Foundation',
      brief: 'The build sheet assigns eno1 to 10.20.30.42/24 with gateway 10.20.30.1. A deployment technician reports that provisioning failed. Compare the server configuration with the build sheet.',
      tasks: [{ key: 'addr', label: 'Read the assigned IP and prefix' }, { key: 'route', label: 'Inspect connected and default routes' }],
      hints: ['Use ip -br addr or ip addr show eno1.', 'Use ip route. Compare each octet and the /24 prefix with the build sheet.'],
      question: 'What should you report and coordinate?',
      answers: ['The host has 10.20.31.42/24 instead of its planned address; correct configuration through the change process.', 'The /24 prefix allows every 10.x.x.x address on the local link.', 'DNS must be the cause of any provisioning failure.', 'The configuration matches the build sheet.'], correct: 0,
      explanation: 'The observed IP and default gateway are on 10.20.31.0/24, while the approved build uses 10.20.30.0/24. Record the mismatch and coordinate validation of IPAM, VLAN, and host configuration before changing anything.'
    },
    {
      id: 'linux-route', title: '03 · Local works, remote fails', topic: 'Routing', level: 'Foundation',
      brief: 'The host can communicate inside 10.20.30.0/24 but cannot reach the provisioning server at 10.50.0.20. Inspect its routes and test that remote IP.',
      tasks: [{ key: 'route', label: 'Inspect the routing table' }, { key: 'remote', label: 'Test 10.50.0.20' }],
      hints: ['Run ip route or ip route get 10.50.0.20.', 'Run ping -c 3 10.50.0.20 and look for a local routing error.'],
      question: 'Which explanation is supported?',
      answers: ['The remote server is certainly powered off.', 'The host has no route to the remote network; verify the intended default or specific route.', 'The Ethernet cable must be disconnected.', 'An ICMP timeout proves a DNS failure.'], correct: 1,
      explanation: 'Only the connected /24 route exists, and the kernel reports Network is unreachable for the remote destination. The local host lacks a usable route. Validate the intended gateway/routing configuration rather than declaring the remote server down.'
    },
    {
      id: 'linux-dns', title: '04 · A server without a name', topic: 'DNS isolation', level: 'Foundation',
      brief: 'Provisioning uses provision.dc.example, expected at 10.50.0.20. Determine why access by hostname fails while the network team says IP connectivity is healthy.',
      tasks: [{ key: 'remote', label: 'Test the known server IP' }, { key: 'dns', label: 'Query provision.dc.example' }],
      hints: ['Try ping -c 3 10.50.0.20 first.', 'Then run dig provision.dc.example or getent hosts provision.dc.example. cat /etc/resolv.conf shows the configured resolver.'],
      question: 'How should you describe the fault?',
      answers: ['The host has proven the remote application is healthy.', 'The NIC has no carrier.', 'IP reachability works, but name resolution fails; investigate DNS.', 'A successful ping proves TCP port 443 is open.'], correct: 2,
      explanation: 'The known IP responds, while name resolution fails; dig reveals a SERVFAIL response. Isolate the resolver/zone path next. ICMP reachability does not prove the application port, TLS, or the full service is healthy.'
    },
    {
      id: 'linux-listener', title: '05 · Port 8443 is missing', topic: 'Sockets & services', level: 'Intermediate',
      brief: 'The local provisioner should listen on TCP 8443. Clients receive connection refused. Inspect listening sockets and the provisioner service before proposing a fix.',
      tasks: [{ key: 'sockets', label: 'Inspect listening TCP sockets' }, { key: 'service', label: 'Check provisioner service state' }],
      hints: ['Use ss -lntp to see listening TCP sockets.', 'Run systemctl status provisioner. A running process and an open listener are different checks.'],
      question: 'What do these checks support?',
      answers: ['The provisioner is inactive and no 8443 listener is present; review the service history and start procedure with its owner.', 'A firewall is conclusively dropping all traffic.', 'DNS is misconfigured.', 'Immediately disable every host firewall rule.'], correct: 0,
      explanation: 'The service is inactive (dead), and ss shows no TCP 8443 listener. Investigate why it stopped and follow the approved recovery procedure. A remote refusal alone is not sufficient to diagnose every firewall or service case.'
    },
    {
      id: 'linux-journal', title: '06 · Failed at startup', topic: 'systemd logs', level: 'Intermediate',
      brief: 'A config rollout was followed by a failed provisioner startup. Read both the service status and its journal, then identify the safest next action.',
      tasks: [{ key: 'service', label: 'Inspect provisioner service status' }, { key: 'journal', label: 'Read the provisioner journal' }],
      hints: ['Run systemctl status provisioner.', 'Use journalctl -u provisioner -n 20 --no-pager.'],
      question: 'What should the service owner address first?',
      answers: ['Replace the top-of-rack switch.', 'Validate and repair or roll back the invalid configuration through the change process.', 'Keep restarting until it works.', 'Delete all service logs.'], correct: 1,
      explanation: 'The journal identifies an invalid listen_port value at line 18 of /etc/provisioner/config.yml. Preserve the failure evidence, coordinate configuration validation or rollback, and then verify startup and application health.'
    },
    {
      id: 'linux-capacity', title: '07 · Out of room', topic: 'Disk capacity', level: 'Intermediate',
      brief: 'Provisioning jobs fail with No space left on device. Check filesystem capacity and narrow the largest consumer under /var before suggesting remediation.',
      tasks: [{ key: 'disk', label: 'Check filesystem byte capacity' }, { key: 'usage', label: 'Measure directory usage under /var' }],
      hints: ['Run df -h to inspect filesystem usage.', 'Run du -sh /var/log or du -h --max-depth=1 /var.'],
      question: 'Which next action best fits these measurements?',
      answers: ['Delete /var recursively.', 'Replace all drives immediately.', 'Coordinate log retention/rotation and approved cleanup; preserve required evidence and verify free space afterward.', 'Increase the DNS timeout.'], correct: 2,
      explanation: '/var is 100% full and /var/log accounts for 37 GB of its 40 GB. Follow retention and change requirements when reclaiming space, then investigate log growth and alerting. Never blindly remove directories or active logs.'
    },
    {
      id: 'linux-inodes', title: '08 · Space, but no files', topic: 'Inode exhaustion', level: 'Intermediate',
      brief: 'New files fail with No space left on device, yet the dashboard shows only 30% byte usage. Compare filesystem byte usage and inode usage.',
      tasks: [{ key: 'disk', label: 'Check byte usage with df -h' }, { key: 'inodes', label: 'Check inode usage with df -i' }],
      hints: ['Begin with df -h. Capacity has more than one limit.', 'Run df -i. Each file normally requires an inode, even if the file is tiny.'],
      question: 'What limitation explains the failure?',
      answers: ['The filesystem has exhausted inodes, likely from many small files; identify the producer and apply approved retention.', 'The filesystem has used every data block.', 'The default gateway is missing.', 'The free byte figure proves the error is impossible.'], correct: 0,
      explanation: 'df -h reports 70% free byte capacity, while df -i reports 100% inode usage. Identify the directories and workload creating many small files, preserve required data, and use approved cleanup or capacity planning.'
    },
    {
      id: 'linux-permissions', title: '09 · Access denied', topic: 'Permissions', level: 'Intermediate',
      brief: 'The validation script /opt/delivery/check.sh fails when run by the delivery account. Inspect its mode and the account identity. Assume ordinary UNIX permissions; no ACL or SELinux policy is involved in this exercise.',
      tasks: [{ key: 'permissions', label: 'Read check.sh ownership and mode' }, { key: 'identity', label: 'Read the delivery account identity' }],
      hints: ['Use ls -l /opt/delivery/check.sh.', 'Use id delivery. In -rw-r-----, no execute bits are set and others have no permissions.'],
      question: 'Which response follows least privilege?',
      answers: ['Set mode 777 on the entire /opt tree.', 'Run every deployment task as root permanently.', 'Have the owner grant only the needed read/execute access to the authorized account/group, then validate.', 'Ignore the mode because .sh files are always executable.'], correct: 2,
      explanation: 'The file is owned by root:ops with mode 640; delivery is outside ops and no execute bits are present. Coordinate narrowly scoped access appropriate to the approved invocation. Do not broadly grant write access or permanent root privileges.'
    },
    {
      id: 'linux-logs', title: '10 · Find the failure pattern', topic: 'Log triage', level: 'Intermediate',
      brief: 'Rack R12 validation is failing during handover. Read recent events in /var/log/delivery.log, then filter error entries to identify the common fault before assigning an owner.',
      tasks: [{ key: 'logs', label: 'Read recent delivery log entries' }, { key: 'filtered', label: 'Filter error entries from the delivery log' }],
      hints: ['Run tail -n 10 /var/log/delivery.log.', 'Run grep ERROR /var/log/delivery.log, or tail -n 20 /var/log/delivery.log | grep ERROR.'],
      question: 'What belongs in your escalation and handover record?',
      answers: ['State that all racks have failed with no supporting details.', 'Report repeated R12 uplink CRC errors with timestamps; coordinate physical-path checks and a passing retest.', 'Certify the rack because one DHCP step passed.', 'Reset every switch without a change record.'], correct: 1,
      explanation: 'The common error is a growing CRC count on R12 uplink eno1. Preserve timestamps, the affected rack/interface, and test evidence; coordinate cable/optic/port investigation and document a passing retest before acceptance. CRC evidence alone does not identify a single failed component.'
    }
  ];

  const sources = [
    ['ip command reference', 'https://man7.org/linux/man-pages/man8/ip.8.html'],
    ['systemctl reference', 'https://www.freedesktop.org/software/systemd/man/latest/systemctl.html'],
    ['journalctl reference', 'https://www.freedesktop.org/software/systemd/man/latest/journalctl.html'],
    ['GNU coreutils manual', 'https://www.gnu.org/software/coreutils/manual/coreutils.html']
  ];
  const HELP = `READ-ONLY TRAINING SHELL · all output is simulated

Network:     ip addr / ip -br addr / ip link / ip route
             ip route get 10.50.0.20
             ping -c 3 10.20.30.1 / ping -c 3 10.50.0.20
DNS:         dig provision.dc.example
             getent hosts provision.dc.example
             cat /etc/resolv.conf
Services:    ss -lntp / systemctl status provisioner
             journalctl -u provisioner -n 20 --no-pager
Storage:     df -h / df -i / du -sh /var/log
             du -h --max-depth=1 /var
Permissions: ls -l /opt/delivery/check.sh / id delivery
Logs:        tail -n 10 /var/log/delivery.log
             grep ERROR /var/log/delivery.log
             tail -n 20 /var/log/delivery.log | grep ERROR
Other:       help / hint / clear / pwd / whoami / hostname

Use ↑ / ↓ for command history. Commands do not contact a real host.
Supported pipes: grep, head, tail. grep supports literal text, -i, -n, -v.
Files, targets, and options are limited
to this lab; unsupported forms are explained instead of being executed.`;
  const DELIVERY_LOG = `Sep 29 14:02:01 dc-build-42 delivery[3201]: INFO rack=R12 DHCP lease acquired
Sep 29 14:02:04 dc-build-42 delivery[3201]: INFO rack=R12 inventory matched build sheet
Sep 29 14:02:10 dc-build-42 delivery[3201]: ERROR rack=R12 interface=eno1 uplink CRC errors delta=482
Sep 29 14:02:12 dc-build-42 delivery[3201]: WARN rack=R12 throughput acceptance test paused
Sep 29 14:03:10 dc-build-42 delivery[3201]: ERROR rack=R12 interface=eno1 uplink CRC errors delta=511
Sep 29 14:03:12 dc-build-42 delivery[3201]: INFO rack=R12 evidence bundle saved; acceptance pending`;
  const FILES = {
    '/etc/resolv.conf': '# Managed by the provisioning system\nnameserver 10.20.30.53\nsearch dc.example',
    '/var/log/delivery.log': DELIVERY_LOG,
    '/opt/delivery/check.sh': '#!/bin/sh\n# Approved rack validation entry point\n/usr/local/bin/rack-validator --read-only'
  };
  function element(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function tokens(str) {
    const out = []; let value = '', quote = null, started = false;
    for (const ch of str.trim()) {
      if (quote) { if (ch === quote) quote = null; else value += ch; started = true; }
      else if (ch === '"' || ch === "'") { quote = ch; started = true; }
      else if (/\s/.test(ch)) { if (started) { out.push(value); value = ''; started = false; } }
      else { value += ch; started = true; }
    }
    if (quote) throw new Error('Unclosed quote. Close the quote and try again.');
    if (started) out.push(value);
    return out;
  }
  function result(text, tags) { return { text, tags: tags || [] }; }
  function hasShort(args, letter) { return args.some(a => /^-[^-]/.test(a) && a.slice(1).includes(letter)); }
  function fileArg(args) { return args.find(a => a.startsWith('/')); }
  function sliceLines(text, args, last) {
    let count = 10;
    const n = args.indexOf('-n');
    if (n >= 0) count = Number(args[n + 1]);
    const compact = args.find(a => /^-\d+$/.test(a));
    if (compact) count = Number(compact.slice(1));
    if (!Number.isInteger(count) || count < 0 || count > 1000) throw new Error('Use a line count from 0 to 1000, such as -n 10.');
    const lines = text.split('\n');
    return (last ? (count ? lines.slice(-count) : []) : lines.slice(0, count)).join('\n');
  }
  function filterLines(text, args) {
    const pattern = args.find(a => !a.startsWith('-'));
    if (!pattern) throw new Error('Use grep PATTERN FILE, for example: grep ERROR /var/log/delivery.log');
    const ignoreCase = hasShort(args, 'i');
    const needle = ignoreCase ? pattern.toLowerCase() : pattern;
    return text.split('\n').map((line, i) => ({ line, number: i + 1 })).filter(x => {
      const match = (ignoreCase ? x.line.toLowerCase() : x.line).includes(needle);
      return hasShort(args, 'v') ? !match : match;
    }).map(x => hasShort(args, 'n') ? x.number + ':' + x.line : x.line).join('\n');
  }
  function simulate(input, mission) {
    if (/[;&><`]/.test(input) || input.includes('$(')) return result('Shell chaining, redirection, and command substitution are not supported in this read-only simulator.');
    const chunks = input.split(/\s*\|\s*/);
    let args = tokens(chunks.shift());
    if (!args.length) return result('');
    if (args[0] === 'sudo') args = args.slice(1);
    const cmd = (args.shift() || '').replace(/^\/usr\/bin\//, '').replace(/^\/bin\//, '');
    const key = mission.id.replace('linux-', '');
    const unhealthyLink = key === 'link';
    const subnet = key === 'address' ? '31' : '30';
    const address = '10.20.' + subnet + '.42';
    const normalRoutes = `default via 10.20.${subnet}.1 dev eno1 proto static\n10.20.${subnet}.0/24 dev eno1 proto kernel scope link src ${address}`;
    let response;
    if (['rm', 'reboot', 'shutdown', 'poweroff', 'halt', 'mkfs', 'dd', 'chmod', 'chown', 'kill', 'killall', 'mount', 'umount', 'apt', 'yum', 'dnf', 'passwd', 'tee'].includes(cmd) || /^(mkfs\.|fsck)/.test(cmd)) {
      return result('This lab only simulates inspection. State-changing or destructive commands are blocked. Collect evidence and explain an approved, least-privilege recovery action in the diagnosis.');
    }
    if (cmd === 'help' || cmd === 'man') response = result(HELP);
    else if (cmd === 'pwd') response = result('/home/delivery');
    else if (cmd === 'whoami') response = result('delivery');
    else if (cmd === 'hostname') response = result('dc-build-42');
    else if (cmd === 'id') {
      if (args[0] && args[0] !== 'delivery') response = result(`id: '${args[0]}': no such user in this lab`);
      else response = result('uid=1001(delivery) gid=1001(delivery) groups=1001(delivery),1002(audit)', ['identity']);
    }
    else if (cmd === 'ip') {
      if (args.some(a => ['set', 'add', 'del', 'delete', 'replace', 'flush'].includes(a))) return result('Interface and route changes are blocked in this inspection lab. Use show or get to gather evidence.');
      const object = args.find(a => !a.startsWith('-')) || 'help';
      if (args.includes('eno2') || args.includes('eth0')) return result('Device not found in this lab. The provisioned interface is eno1.');
      if (['a', 'addr', 'address'].includes(object)) {
        response = result(args.some(a => a === '-br' || a === '-brief') ? `lo               UNKNOWN        127.0.0.1/8 ::1/128\neno1             ${unhealthyLink ? 'DOWN' : 'UP  '}           ${address}/24` : `2: eno1: <${unhealthyLink ? 'NO-CARRIER,BROADCAST,MULTICAST,UP' : 'BROADCAST,MULTICAST,UP,LOWER_UP'}> mtu 1500 state ${unhealthyLink ? 'DOWN' : 'UP'}\n    link/ether 02:42:ac:14:1e:2a brd ff:ff:ff:ff:ff:ff\n    inet ${address}/24 brd 10.20.${subnet}.255 scope global eno1\n       valid_lft forever preferred_lft forever`, ['addr']);
      } else if (['l', 'link'].includes(object)) response = result(`2: eno1: <${unhealthyLink ? 'NO-CARRIER,BROADCAST,MULTICAST,UP' : 'BROADCAST,MULTICAST,UP,LOWER_UP'}> mtu 1500 qdisc mq state ${unhealthyLink ? 'DOWN' : 'UP'} mode DEFAULT group default qlen 1000\n    link/ether 02:42:ac:14:1e:2a brd ff:ff:ff:ff:ff:ff`, ['link']);
      else if (['r', 'route'].includes(object)) {
        if (args.includes('get')) {
          const destination = args[args.indexOf('get') + 1];
          if (!destination || !['10.50.0.20', '10.20.30.1'].includes(destination)) response = result('Supported route lookup: ip route get 10.50.0.20');
          else response = result(key === 'route' && destination === '10.50.0.20' ? 'RTNETLINK answers: Network is unreachable' : `${destination} ${destination === '10.50.0.20' ? `via 10.20.${subnet}.1 ` : ''}dev eno1 src ${address} uid 1001\n    cache`, ['route']);
        } else response = result(key === 'route' ? `10.20.30.0/24 dev eno1 proto kernel scope link src ${address}` : normalRoutes, ['route']);
      } else response = result('Use ip addr, ip link, ip route, or ip route get 10.50.0.20.');
    }
    else if (cmd === 'ping') {
      const target = args.find(a => ['10.20.30.1', '10.20.31.1', '10.50.0.20', 'provision.dc.example', 'localhost', '127.0.0.1'].includes(a));
      if (!target) response = result('Lab targets: 10.20.30.1 (gateway), 10.50.0.20 (provisioner), provision.dc.example, or localhost.');
      else if (key === 'dns' && target === 'provision.dc.example') response = result('ping: provision.dc.example: Temporary failure in name resolution', ['dns']);
      else if (key === 'route' && ['10.50.0.20', 'provision.dc.example'].includes(target)) response = result('ping: connect: Network is unreachable', ['remote']);
      else {
        const targetIP = target === 'provision.dc.example' ? '10.50.0.20' : target === 'localhost' ? '127.0.0.1' : target;
        const tags = target === '10.20.30.1' ? ['ping'] : targetIP === '10.50.0.20' ? ['remote'] : [];
        const unreachable = unhealthyLink && targetIP !== '127.0.0.1';
        const countAt = args.indexOf('-c');
        const count = countAt >= 0 ? Math.max(1, Math.min(4, Number(args[countAt + 1]) || 3)) : 3;
        response = result(`PING ${target} (${targetIP}) 56(84) bytes of data.\n` + Array.from({ length: count }, (_, i) => unreachable ? `From ${address} icmp_seq=${i + 1} Destination Host Unreachable` : `64 bytes from ${targetIP}: icmp_seq=${i + 1} ttl=${targetIP === '10.50.0.20' ? 61 : 64} time=0.${341 + i * 13} ms`).join('\n') + `\n\n--- ${target} ping statistics ---\n${count} packets transmitted, ${unreachable ? 0 : count} received, ${unreachable ? '100' : '0'}% packet loss\n[Simulation bounded to at most 4 packets.]`, tags);
      }
    }
    else if (cmd === 'dig' || cmd === 'nslookup' || cmd === 'getent') {
      const target = args.find(a => a === 'provision.dc.example');
      if (!target || (cmd === 'getent' && !args.some(a => ['hosts', 'ahosts', 'ahostsv4'].includes(a)))) response = result('Use dig provision.dc.example or getent hosts provision.dc.example.');
      else if (cmd === 'getent') response = result(key === 'dns' ? '[No matching address returned; simulated exit status 2.]\nTip: dig provision.dc.example exposes the resolver response.' : '10.50.0.20    provision.dc.example', ['dns']);
      else if (key === 'dns') response = result(cmd === 'nslookup' ? 'Server: 10.20.30.53\nAddress: 10.20.30.53#53\n** server can\'t find provision.dc.example: SERVFAIL' : ';; ->>HEADER<<- opcode: QUERY, status: SERVFAIL, id: 2417\n;; flags: qr rd ra; QUERY: 1, ANSWER: 0, AUTHORITY: 0\n;; QUESTION SECTION:\n;provision.dc.example. IN A\n;; SERVER: 10.20.30.53#53(10.20.30.53)\n;; Query time: 12 msec', ['dns']);
      else response = result(args.includes('+short') ? '10.50.0.20' : ';; ->>HEADER<<- opcode: QUERY, status: NOERROR\n;; ANSWER SECTION:\nprovision.dc.example. 300 IN A 10.50.0.20\n;; SERVER: 10.20.30.53#53(10.20.30.53)', ['dns']);
    }
    else if (cmd === 'ss' || cmd === 'netstat') {
      if ((!hasShort(args, 'l') && !args.includes('--listening')) || (!hasShort(args, 't') && !args.includes('--tcp'))) response = result('For this mission, inspect TCP listeners with ss -lntp.');
      else response = result('State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port  Process\nLISTEN  0       128     0.0.0.0:22           0.0.0.0:*          users:(("sshd",pid=701,fd=3))\nLISTEN  0       128     127.0.0.1:631        0.0.0.0:*          users:(("cupsd",pid=790,fd=7))' + (key === 'listener' || key === 'journal' ? '' : '\nLISTEN  0       128     0.0.0.0:8443         0.0.0.0:*          users:(("provisioner",pid=3122,fd=8))'), ['sockets']);
    }
    else if (cmd === 'systemctl') {
      if (args.some(a => ['start', 'stop', 'restart', 'reload', 'enable', 'disable', 'mask', 'unmask', 'daemon-reload', 'reboot', 'poweroff'].includes(a))) return result('Service changes are blocked in this inspection lab. Use systemctl status provisioner and journalctl -u provisioner.');
      if (!args.includes('status') || !args.some(a => /^provisioner(\.service)?$/.test(a))) response = result('This lab supports systemctl status provisioner (or provisioner.service).');
      else response = result(`● provisioner.service - Rack Provisioning Service\n   Loaded: loaded (/etc/systemd/system/provisioner.service; enabled)\n   Active: ${key === 'listener' ? 'inactive (dead)' : key === 'journal' ? 'failed (Result: exit-code)' : 'active (running)'} since Tue 2026-09-29 14:01:22 UTC\n` + (key === 'journal' ? '  Process: 3122 ExecStart=/usr/local/bin/provisioner (code=exited, status=1/FAILURE)\nSep 29 14:01:22 dc-build-42 systemd[1]: provisioner.service: Failed with result exit-code.' : key === 'listener' ? 'Sep 29 14:01:22 dc-build-42 systemd[1]: Stopped Rack Provisioning Service.' : ' Main PID: 3122 (provisioner)\n    Tasks: 4\n   Memory: 28.1M'), ['service']);
    }
    else if (cmd === 'journalctl') {
      if (args.some(a => a.startsWith('--vacuum') || ['--rotate', '--flush'].includes(a))) return result('Journal changes are blocked. Read logs with journalctl -u provisioner.');
      const unitIndex = args.findIndex(a => a === '-u' || a === '--unit');
      const unit = unitIndex >= 0 ? args[unitIndex + 1] : (args.find(a => a.startsWith('--unit=')) || '').split('=')[1];
      if (unit && !/^provisioner(\.service)?$/.test(unit)) response = result('-- No entries for that unit in this lab. Use provisioner. --');
      else response = result(key === 'journal' ? 'Sep 29 14:01:21 dc-build-42 systemd[1]: Starting Rack Provisioning Service...\nSep 29 14:01:22 dc-build-42 provisioner[3122]: ERROR /etc/provisioner/config.yml:18: listen_port must be an integer, got "eight-four-four-three"\nSep 29 14:01:22 dc-build-42 provisioner[3122]: Configuration validation failed; exiting\nSep 29 14:01:22 dc-build-42 systemd[1]: provisioner.service: Main process exited, code=exited, status=1/FAILURE\nSep 29 14:01:22 dc-build-42 systemd[1]: Failed to start Rack Provisioning Service.' : key === 'listener' ? 'Sep 29 14:01:20 dc-build-42 systemd[1]: Stopping Rack Provisioning Service...\nSep 29 14:01:22 dc-build-42 systemd[1]: provisioner.service: Deactivated successfully.\nSep 29 14:01:22 dc-build-42 systemd[1]: Stopped Rack Provisioning Service.' : 'Sep 29 14:01:22 dc-build-42 systemd[1]: Started Rack Provisioning Service.\nSep 29 14:01:23 dc-build-42 provisioner[3122]: Listening on 0.0.0.0:8443\nSep 29 14:02:01 dc-build-42 provisioner[3122]: Health check passed.', ['journal']);
    }
    else if (cmd === 'df') {
      if (hasShort(args, 'i') || args.includes('--inodes')) response = result('Filesystem       Inodes    IUsed    IFree IUse% Mounted on\n/dev/nvme0n1p2  6553600   115400  6438200    2% /\n/dev/nvme1n1p1  2621440 ' + (key === 'inodes' ? ' 2621440        0  100%' : '   65000  2556440    3%') + ' /var', ['inodes']);
      else response = result('Filesystem      Size  Used Avail Use% Mounted on\n/dev/nvme0n1p2  100G   21G   79G  21% /\n/dev/nvme1n1p1   40G  ' + (key === 'capacity' ? ' 40G     0 100%' : ' 12G   28G  30%') + ' /var\ntmpfs           8.0G  4.0M  8.0G   1% /run', ['disk']);
    }
    else if (cmd === 'du') {
      const path = fileArg(args) || '.';
      if (!['/var', '/var/', '/var/log', '/var/log/', '/var/*'].includes(path)) response = result('Directory usage is available for /var and /var/log. Try du -sh /var/log.');
      else response = result(path.replace(/\/$/, '') === '/var/log' ? `${key === 'capacity' ? '37G' : '1.2G'}\t/var/log` : `${key === 'capacity' ? '37G' : '1.2G'}\t/var/log\n1.5G\t/var/lib\n512M\t/var/cache\n${key === 'capacity' ? '39G' : '12G'}\t/var`, ['usage']);
    }
    else if (cmd === 'ls') {
      const path = fileArg(args) || '/opt/delivery';
      if (!['/opt/delivery', '/opt/delivery/', '/opt/delivery/check.sh'].includes(path)) response = result('This lab provides /opt/delivery/check.sh. Try ls -l /opt/delivery/check.sh.');
      else if (hasShort(args, 'l')) response = result('-rw-r----- 1 root ops 127 Sep 29 13:48 ' + (path.endsWith('check.sh') ? path : 'check.sh'), ['permissions']);
      else response = result('check.sh\nTip: ls -l shows ownership and permission bits.');
    }
    else if (['cat', 'tail', 'head', 'grep'].includes(cmd)) {
      const path = fileArg(args);
      if (!path || !Object.prototype.hasOwnProperty.call(FILES, path)) response = result(`${cmd}: file not found in this lab. Available: /etc/resolv.conf, /var/log/delivery.log, /opt/delivery/check.sh`);
      else if (key === 'permissions' && path === '/opt/delivery/check.sh' && !input.trim().startsWith('sudo ')) response = result(`${cmd}: ${path}: Permission denied`);
      else {
        let content = FILES[path];
        const tags = path === '/var/log/delivery.log' && cmd !== 'grep' ? ['logs'] : [];
        if (cmd === 'tail' || cmd === 'head') content = sliceLines(content, args, cmd === 'tail');
        if (cmd === 'grep') {
          content = filterLines(content, args.filter(a => a !== path));
          if (path === '/var/log/delivery.log' && content.includes('ERROR')) tags.push('filtered');
        }
        response = result(content || '[No matching lines.]', tags);
      }
    }
    else response = result(`${cmd || 'command'}: not supported in this simulation. Type help for available commands.`);
    for (const pipe of chunks) {
      const next = tokens(pipe); const operation = next.shift();
      if (operation === 'grep') {
        response.text = filterLines(response.text, next) || '[No matching lines.]';
        if (response.tags.includes('logs') && response.text.includes('ERROR')) response.tags.push('filtered');
      } else if (operation === 'tail' || operation === 'head') response.text = sliceLines(response.text, next, operation === 'tail');
      else return result('Only grep, head, and tail are supported after a pipe in this simulator.');
    }
    return response;
  }

  function mount(container, options) {
    const opts = options || {};
    const abort = new AbortController();
    const saved = new Map();
    const verified = new Set(opts.completedIds || []);
    let current = 0;
    const history = [];
    let historyIndex = 0, draft = '';
    const root = element('section', 'linux-lab');
    const intro = element('div', 'linux-intro');
    const introCopy = element('div');
    introCopy.append(element('div', 'linux-eyebrow', 'HANDS ON / SIMULATED ENVIRONMENT'), element('h2', '', 'Linux field lab'), element('p', 'linux-muted', 'Read the signals. Find the fault. Explain your next move.'));
    intro.append(introCopy, element('span', 'linux-safe-badge', '● Read-only sandbox'));
    const layout = element('div', 'linux-layout');
    const side = element('aside', 'linux-sidebar');
    side.setAttribute('aria-label', 'Linux missions');
    side.append(element('p', 'linux-eyebrow', '10 FIELD MISSIONS'));
    const missionList = element('div', 'linux-mission-list');
    const buttons = missions.map((m, i) => {
      const b = element('button', 'linux-mission-button'); b.type = 'button';
      b.append(element('span', 'linux-mission-title', m.title), element('span', 'linux-mission-meta', m.topic));
      b.addEventListener('click', () => loadMission(i), { signal: abort.signal });
      missionList.append(b); return b;
    });
    const reference = element('details', 'linux-reference');
    reference.append(element('summary', '', 'Command references'));
    const referenceList = element('div', 'linux-reference-links');
    sources.forEach(([label, url]) => { const a = element('a', '', label); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; referenceList.append(a); });
    reference.append(referenceList);
    side.append(missionList, reference);
    const workspace = element('div', 'linux-workspace');
    const briefing = element('div', 'linux-briefing');
    const meta = element('div', 'linux-eyebrow');
    const heading = element('h3'); const brief = element('p', 'linux-brief');
    const tasks = element('ul', 'linux-checklist');
    const controls = element('div', 'linux-controls');
    function button(text, action, className) { const b = element('button', className || 'linux-small-button', text); b.type = 'button'; b.addEventListener('click', action, { signal: abort.signal }); return b; }
    const helpButton = button('Command guide', () => { appendOutput(HELP, 'info'); input.focus(); });
    const hintButton = button('Get a hint', showHint);
    const resetButton = button('Reset mission', () => { saved.delete(current); loadMission(current); input.focus(); });
    controls.append(helpButton, hintButton, resetButton);
    briefing.append(meta, heading, brief, tasks, controls);
    const terminal = element('div', 'linux-terminal');
    const terminalBar = element('div', 'linux-terminal-bar');
    terminalBar.append(element('span', 'linux-terminal-dots', '● ● ●'), element('span', '', 'delivery@dc-build-42:~'), element('span', 'linux-terminal-label', 'SIMULATION'));
    const output = element('div', 'linux-output'); output.setAttribute('role', 'log'); output.setAttribute('aria-label', 'Terminal output'); output.setAttribute('aria-live', 'polite'); output.tabIndex = 0;
    const form = element('form', 'linux-command-form');
    const label = element('label', 'linux-prompt', '$'); label.htmlFor = 'linux-command-input';
    const input = element('input', 'linux-command-input'); input.id = 'linux-command-input'; input.type = 'text'; input.setAttribute('aria-label', 'Linux command'); input.autocomplete = 'off'; input.spellcheck = false; input.autocapitalize = 'none'; input.placeholder = 'Type a command, or help'; input.maxLength = 300;
    const run = element('button', 'linux-run-button', 'Run ↵'); run.type = 'submit';
    form.append(label, input, run); terminal.append(terminalBar, output, form);
    const terminalNote = element('p', 'linux-terminal-note', 'Nothing runs on your device. ↑ ↓ command history · help for commands · clear for a fresh screen');
    const diagnosis = element('section', 'linux-diagnosis');
    const lockLabel = element('p', 'linux-eyebrow', 'STEP 2 / MAKE THE CALL');
    const question = element('h3'); const diagnosisNote = element('p', 'linux-muted');
    const answerList = element('div', 'linux-answer-list');
    const feedback = element('div', 'linux-feedback'); feedback.setAttribute('role', 'status');
    diagnosis.append(lockLabel, question, diagnosisNote, answerList, feedback);
    workspace.append(briefing, terminal, terminalNote, diagnosis); layout.append(side, workspace); root.append(intro, layout); container.replaceChildren(root);

    function state() {
      if (!saved.has(current)) saved.set(current, { seen: new Set(), attempts: 0, hints: 0, done: false, entries: [], eliminated: new Set() });
      return saved.get(current);
    }
    function appendOutput(text, kind, save) {
      const line = element('pre', 'linux-output-line' + (kind ? ' linux-output-' + kind : ''), text);
      output.append(line);
      if (save !== false) {
        state().entries.push({ text, kind });
        if (state().entries.length > 100) state().entries.shift();
      }
      while (output.childNodes.length > 100) output.firstChild.remove();
      output.scrollTop = output.scrollHeight;
    }
    function renderEvidence() {
      const m = missions[current], s = state();
      tasks.replaceChildren();
      m.tasks.forEach(task => {
        const done = s.seen.has(task.key);
        tasks.append(element('li', done ? 'linux-evidence-done' : '', (done ? '✓ ' : '○ ') + task.label));
      });
      const ready = m.tasks.every(task => s.seen.has(task.key));
      diagnosisNote.textContent = s.done ? 'Mission complete. Reset to practice again or select another mission.' : ready ? 'Evidence collected. Choose the strongest diagnosis and next action.' : 'Collect both pieces of evidence to unlock the diagnosis.';
      answerList.querySelectorAll('button').forEach((b, i) => { b.disabled = !ready || s.done || s.eliminated.has(i); });
    }
    function chooseAnswer(index) {
      const m = missions[current], s = state();
      if (s.done || !m.tasks.every(task => s.seen.has(task.key))) return;
      if (index !== m.correct) {
        s.attempts += 1; s.eliminated.add(index);
        feedback.className = 'linux-feedback linux-feedback-error';
        feedback.textContent = 'That conclusion is not supported by the observed evidence. Compare the outputs and choose the narrowest justified action. −15 points';
        const b = answerList.children[index]; b.classList.add('linux-answer-wrong'); b.setAttribute('aria-label', b.textContent + ' — incorrect');
        renderEvidence(); return;
      }
      s.done = true;
      const score = Math.max(40, 100 - s.attempts * 15 - s.hints * 5);
      s.score = score;
      feedback.className = 'linux-feedback linux-feedback-success';
      feedback.replaceChildren(element('strong', '', 'Mission verified · ' + score + '/100'), element('p', '', m.explanation));
      answerList.children[index].classList.add('linux-answer-correct');
      buttons[current].classList.add('linux-mission-complete');
      renderEvidence();
      verified.add(m.id);
      if (typeof opts.onComplete === 'function') opts.onComplete({ id: m.id, score, max: 100 });
    }
    function showHint() {
      const m = missions[current], s = state();
      if (s.done) { appendOutput('Mission already verified. Reset it to practice again, or select another mission.', 'info'); input.focus(); return; }
      const hint = m.hints[Math.min(s.hints, m.hints.length - 1)];
      if (s.hints < m.hints.length) s.hints += 1;
      appendOutput('HINT · ' + hint + '\nFirst use of each hint costs 5 mission points.', 'hint'); input.focus();
    }
    function loadMission(index) {
      current = index;
      const m = missions[current], s = state();
      buttons.forEach((b, i) => { b.classList.toggle('linux-mission-active', i === current); b.setAttribute('aria-pressed', String(i === current)); b.classList.toggle('linux-mission-complete', verified.has(missions[i].id) || Boolean(saved.get(i) && saved.get(i).done)); });
      meta.textContent = m.topic.toUpperCase() + ' / ' + m.level.toUpperCase(); heading.textContent = m.title; brief.textContent = m.brief; question.textContent = m.question;
      input.value = ''; output.replaceChildren(); feedback.replaceChildren(); feedback.className = 'linux-feedback';
      answerList.replaceChildren();
      m.answers.forEach((answer, i) => {
        const b = button('', () => chooseAnswer(i), 'linux-answer');
        b.append(element('span', 'linux-answer-letter', String.fromCharCode(65 + i)), element('span', '', answer));
        if (s.eliminated.has(i)) b.classList.add('linux-answer-wrong');
        if (s.done && i === m.correct) b.classList.add('linux-answer-correct');
        answerList.append(b);
      });
      if (!s.entries.length) appendOutput('Connected to the simulated dc-build-42.\n' + m.brief + '\n\nType help for available inspection commands.', 'welcome');
      else s.entries.forEach(entry => appendOutput(entry.text, entry.kind, false));
      if (s.done) { feedback.className = 'linux-feedback linux-feedback-success'; feedback.append(element('strong', '', 'Mission verified · ' + s.score + '/100'), element('p', '', m.explanation)); }
      renderEvidence();
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      const command = input.value.trim();
      if (!command) return;
      history.push(command); historyIndex = history.length; draft = ''; input.value = '';
      if (command === 'clear') { output.replaceChildren(); state().entries = []; input.focus(); return; }
      appendOutput('delivery@dc-build-42:~$ ' + command, 'command');
      if (command === 'hint') { showHint(); return; }
      try {
        const response = simulate(command, missions[current]);
        appendOutput(response.text);
        response.tags.forEach(tag => state().seen.add(tag));
        renderEvidence();
      } catch (error) { appendOutput(error.message || 'Unsupported command form. Type help for examples.', 'error'); }
      input.focus();
    }, { signal: abort.signal });
    input.addEventListener('keydown', event => {
      if (event.key === 'ArrowUp') {
        event.preventDefault(); if (historyIndex === history.length) draft = input.value;
        if (historyIndex > 0) input.value = history[--historyIndex];
      } else if (event.key === 'ArrowDown') {
        event.preventDefault(); if (historyIndex < history.length - 1) input.value = history[++historyIndex];
        else { historyIndex = history.length; input.value = draft; }
      } else if (event.key === 'l' && event.ctrlKey) { event.preventDefault(); output.replaceChildren(); state().entries = []; }
    }, { signal: abort.signal });
    loadMission(0);
    return function cleanup() { abort.abort(); root.remove(); };
  }
  window.LinuxLab = { mount, missions: missions.map(({ id, title, topic }) => ({ id, title, topic })) };
})();
