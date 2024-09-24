namespace scout
{
    partial class Form1
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Form1));
            this.labelAppId = new System.Windows.Forms.Label();
            this.labelDiscordToken = new System.Windows.Forms.Label();
            this.labelPublicKey = new System.Windows.Forms.Label();
            this.txtAppId = new System.Windows.Forms.TextBox();
            this.txtDiscordToken = new System.Windows.Forms.TextBox();
            this.txtPublicKey = new System.Windows.Forms.TextBox();
            this.btnRunApp = new System.Windows.Forms.Button();
            this.btnStopApp = new System.Windows.Forms.Button();
            this.txtSubdomain = new System.Windows.Forms.TextBox();
            this.labelSubdomain = new System.Windows.Forms.Label();
            this.SuspendLayout();
            // 
            // labelAppId
            // 
            this.labelAppId.AutoSize = true;
            this.labelAppId.Location = new System.Drawing.Point(49, 15);
            this.labelAppId.Name = "labelAppId";
            this.labelAppId.Size = new System.Drawing.Size(43, 13);
            this.labelAppId.TabIndex = 0;
            this.labelAppId.Text = "App ID:";
            // 
            // labelDiscordToken
            // 
            this.labelDiscordToken.AutoSize = true;
            this.labelDiscordToken.Location = new System.Drawing.Point(12, 41);
            this.labelDiscordToken.Name = "labelDiscordToken";
            this.labelDiscordToken.Size = new System.Drawing.Size(80, 13);
            this.labelDiscordToken.TabIndex = 1;
            this.labelDiscordToken.Text = "Discord Token:";
            // 
            // labelPublicKey
            // 
            this.labelPublicKey.AutoSize = true;
            this.labelPublicKey.Location = new System.Drawing.Point(32, 67);
            this.labelPublicKey.Name = "labelPublicKey";
            this.labelPublicKey.Size = new System.Drawing.Size(60, 13);
            this.labelPublicKey.TabIndex = 2;
            this.labelPublicKey.Text = "Public Key:";
            // 
            // txtAppId
            // 
            this.txtAppId.Location = new System.Drawing.Point(98, 12);
            this.txtAppId.Name = "txtAppId";
            this.txtAppId.Size = new System.Drawing.Size(262, 20);
            this.txtAppId.TabIndex = 3;
            // 
            // txtDiscordToken
            // 
            this.txtDiscordToken.Location = new System.Drawing.Point(98, 38);
            this.txtDiscordToken.Name = "txtDiscordToken";
            this.txtDiscordToken.Size = new System.Drawing.Size(262, 20);
            this.txtDiscordToken.TabIndex = 4;
            // 
            // txtPublicKey
            // 
            this.txtPublicKey.Location = new System.Drawing.Point(98, 64);
            this.txtPublicKey.Name = "txtPublicKey";
            this.txtPublicKey.Size = new System.Drawing.Size(262, 20);
            this.txtPublicKey.TabIndex = 5;
            // 
            // btnRunApp
            // 
            this.btnRunApp.Location = new System.Drawing.Point(98, 122);
            this.btnRunApp.Name = "btnRunApp";
            this.btnRunApp.Size = new System.Drawing.Size(75, 23);
            this.btnRunApp.TabIndex = 6;
            this.btnRunApp.Text = "Run";
            this.btnRunApp.UseVisualStyleBackColor = true;
            this.btnRunApp.Click += new System.EventHandler(this.btnRunApp_Click);
            // 
            // btnStopApp
            // 
            this.btnStopApp.Location = new System.Drawing.Point(179, 122);
            this.btnStopApp.Name = "btnStopApp";
            this.btnStopApp.Size = new System.Drawing.Size(75, 23);
            this.btnStopApp.TabIndex = 7;
            this.btnStopApp.Text = "Stop";
            this.btnStopApp.UseVisualStyleBackColor = true;
            this.btnStopApp.Click += new System.EventHandler(this.btnStopApp_Click);
            // 
            // txtSubdomain
            // 
            this.txtSubdomain.Location = new System.Drawing.Point(98, 90);
            this.txtSubdomain.Name = "txtSubdomain";
            this.txtSubdomain.Size = new System.Drawing.Size(262, 20);
            this.txtSubdomain.TabIndex = 8;
            // 
            // labelSubdomain
            // 
            this.labelSubdomain.AutoSize = true;
            this.labelSubdomain.Location = new System.Drawing.Point(29, 93);
            this.labelSubdomain.Name = "labelSubdomain";
            this.labelSubdomain.Size = new System.Drawing.Size(63, 13);
            this.labelSubdomain.TabIndex = 9;
            this.labelSubdomain.Text = "Subdomain:";
            // 
            // Form1
            // 
            this.ClientSize = new System.Drawing.Size(374, 152);
            this.Controls.Add(this.labelSubdomain);
            this.Controls.Add(this.txtSubdomain);
            this.Controls.Add(this.btnStopApp);
            this.Controls.Add(this.btnRunApp);
            this.Controls.Add(this.txtPublicKey);
            this.Controls.Add(this.txtDiscordToken);
            this.Controls.Add(this.txtAppId);
            this.Controls.Add(this.labelPublicKey);
            this.Controls.Add(this.labelDiscordToken);
            this.Controls.Add(this.labelAppId);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.MaximizeBox = false;
            this.Name = "Form1";
            this.Text = "ToonScout";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.Form1_FormClosing);
            this.Load += new System.EventHandler(this.Form1_Load);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        private System.Windows.Forms.Label labelAppId;
        private System.Windows.Forms.Label labelDiscordToken;
        private System.Windows.Forms.Label labelPublicKey;
        private System.Windows.Forms.TextBox txtAppId;
        private System.Windows.Forms.TextBox txtDiscordToken;
        private System.Windows.Forms.TextBox txtPublicKey;
        private System.Windows.Forms.Button btnRunApp;
        private System.Windows.Forms.Button btnStopApp;
        private System.Windows.Forms.TextBox txtSubdomain;
        private System.Windows.Forms.Label labelSubdomain;
    }
}

#endregion