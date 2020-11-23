using ElectronCgi.DotNet;
using Discord;
using System.ComponentModel;
using System.Threading;
using System;

namespace Core
{
    class Program
    {
        static void Main(string[] args)
        {
            Discord.Discord discord = new Discord.Discord(477175586805252107, (ulong)Discord.CreateFlags.Default);
            Connection connection = new ConnectionBuilder().WithLogging().Build();

            VoiceManager mgr = discord.GetVoiceManager();
            discord.VoiceManagerInstance.SetSelfMute(true);
            mgr.SetSelfMute(true);
            UserManager usermgr = discord.GetUserManager();
            Console.WriteLine(usermgr.GetCurrentUser().Id);
            
            connection.On<bool, bool>("setmute", status => {
                VoiceManager mgr = discord.GetVoiceManager();
                mgr.SetSelfMute(status);
                return status;
            });

            connection.Listen();

            var timer1 = new Timer(_ => discord.RunCallbacks(), null, 0, 1000/60);
        }
    }
}