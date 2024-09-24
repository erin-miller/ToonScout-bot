using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace scout
{
    public partial class Form1 : Form
    {
        private Process runningProcess;
        private System.Windows.Forms.Timer cooldown;
        private int cooldownDuration = 1000;
        public Form1()
        {
            InitializeComponent();

            cooldown = new System.Windows.Forms.Timer();
            cooldown.Interval = cooldownDuration;
            cooldown.Tick += Cooldown_tick;
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            LoadEnv();
        }

        private void Cooldown_tick(object sender, EventArgs e)
        {
            cooldown.Stop();
            btnRunApp.Enabled = true;
        }

        private void btnRunApp_Click(object sender, EventArgs e)
        {
            btnRunApp.Enabled = false;
            btnStopApp.Enabled = true;

            string appId = txtAppId.Text;
            string discordToken = txtDiscordToken.Text;
            string publicKey = txtPublicKey.Text;
            string subdomain = txtSubdomain.Text;

            // save config
            string content = $"APP_ID={appId}\nDISCORD_TOKEN={discordToken}\nPUBLIC_KEY={publicKey}\nSUBDOMAIN={subdomain}";
            File.WriteAllText(".env", content);
            RunStartup();
        }
        private void btnStopApp_Click(object sender, EventArgs e)
        {
            cooldown.Start(); 
            logFile.WriteLine("Stopping the application at " + DateTime.Now);
            logFile.Flush();
            StopStartup();
        }


        private StreamWriter logFile; // Class-level field to store the StreamWriter

        private void RunStartup()
        {
            string appDirectory = AppDomain.CurrentDomain.BaseDirectory;
            string logPath = Path.Combine(appDirectory, "logs", "runScout.log");

            // clear logfile
            if (File.Exists(logPath))
            {
                File.Delete(logPath);
            }

            string scriptPath = Path.Combine(appDirectory, "runScout.bat");

            Directory.CreateDirectory(Path.Combine(appDirectory, "logs")); // Ensure logs directory exists

            ProcessStartInfo processInfo = new ProcessStartInfo
            {
                FileName = "cmd.exe",
                Arguments = $"/c \"\"{scriptPath}\" {txtSubdomain.Text}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            runningProcess = Process.Start(processInfo);

            logFile = new StreamWriter(logPath, append: true);
            logFile.WriteLine("Starting the application at " + DateTime.Now);
            logFile.Flush();

            runningProcess.OutputDataReceived += (sender, args) =>
            {
                if (!string.IsNullOrEmpty(args.Data))
                {
                    logFile.WriteLine(args.Data);
                    logFile.Flush();
                }
            };

            runningProcess.ErrorDataReceived += (sender, args) =>
            {
                if (!string.IsNullOrEmpty(args.Data))
                {
                    logFile.WriteLine("ERROR: " + args.Data);
                    logFile.Flush();
                }
            };

            runningProcess.BeginOutputReadLine();
            runningProcess.BeginErrorReadLine();
        }
        private void StopStartup()
        {
            if (runningProcess != null && !runningProcess.HasExited)
            {
                runningProcess.Kill();
                runningProcess.WaitForExit();
                runningProcess = null;
            }

            KillProcessByName("node");
            KillProcessByName("lt");

            btnStopApp.Enabled = false;

            // Close the log file if it's still open
            logFile?.Close();
            logFile = null; // Prevent further access

        }

    private void KillProcessByName(string processName)
    {
        var processes = Process.GetProcessesByName(processName);
        foreach (var process in processes)
        {
            process.Kill();
            process.WaitForExit(); // Optional: wait for the process to exit
        }
    }

    private void LoadEnv()
        {
            btnStopApp.Enabled = false;
            string filePath = ".env";

            if (File.Exists(filePath))
            {
                string[] lines = File.ReadAllLines(filePath);

                foreach (var line in lines)
                {
                    var keyValue = line.Split('=');
                    if (keyValue.Length == 2)
                    {
                        string key = keyValue[0].Trim();
                        string value = keyValue[1].Trim();

                        if (key == "APP_ID")
                        {
                            txtAppId.Text = value;
                        }
                        else if (key == "DISCORD_TOKEN")
                        {
                            txtDiscordToken.Text = value;
                        }
                        else if (key == "PUBLIC_KEY")
                        {
                            txtPublicKey.Text = value;
                        } 
                        else if (key == "SUBDOMAIN")
                        {
                            txtSubdomain.Text = value;
                        }
                    }
                }
            }
        }

        private void Form1_FormClosing(object sender, FormClosingEventArgs e)
        {
            StopStartup();
        }
    }
}
