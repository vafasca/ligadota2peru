import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AccessCodeDialogComponent } from '../access-code-dialog/access-code-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

selectedTier: any;

featuredStreamer = {
    name: 'Vanngg',
    avatar: '../../../../../assets/streamers/vann_grid.webp',
    description: 'Ex Jugador Profesional. Especialista en carries y estrategias agresivas, pero una lesión en el dedo meñique cambió mi destino y ahora de día soy COMANCHE😁y de noche RATAMANCHE 🐀',
    socialLinks: [
      { name: 'Twitch', url: 'https://kick.com/vanngg', icon: 'fa-brands fa-kickstarter' },
      { name: 'YouTube', url: 'https://www.youtube.com/@VanN.Catedra', icon: 'fab fa-youtube' },
      { name: 'Twitter', url: 'https://x.com/vanN_Gosu', icon: 'fab fa-twitter' },
      { name: 'Instagram', url: 'https://www.instagram.com/vann.dota/', icon: 'fab fa-instagram' },
      { name: 'tiktok', url: 'https://www.tiktok.com/@vann.gosu', icon: 'fab fa-tiktok' }
    ]
  };

  topStreamers = [
    { name: 'Iwobeka', avatar: '../../../../../assets/streamers/iwo_streamer.png', viewers: 15.2, wins: 12 },
    { name: 'Masokugg', avatar: '../../../../../assets/streamers/masoku_streamer.png', viewers: 12.8, wins: 8 },
    { name: 'Stingerdota', avatar: '../../../../../assets/streamers/stinger_streamer.png', viewers: 9.5, wins: 10 },
    { name: 'Jerichodota', avatar: '../../../../../assets/streamers/jericho_streamer.png', viewers: 7.3, wins: 6 },
    { name: 'Smashdota', avatar: '../../../../../assets/streamers/smash_streamer.png', viewers: 11.1, wins: 9 },
    { name: 'Leostyledota', avatar: '../../../../../assets/streamers/leostyle_streamer.png', viewers: 8.7, wins: 7 },
    { name: 'vanngg', avatar: '../../../../../assets/streamers/vann_streamer.png', viewers: 8.7, wins: 7 },
    { name: 'kotaromnzdota', avatar: '../../../../../assets/streamers/kotaro_streamer.png', viewers: 8.7, wins: 7 }
  ];

  tiers = [
    {
      name: 'Tier 1',
      players: [
        { nick: 'DotaMaster', avatar: '../../../../../assets/add_icon.png', points: 2450, mmr: 6500 },
        { nick: 'MidOrFeed', avatar: '../../../../../assets/add_icon.png', points: 2300, mmr: 6300 },
        { nick: 'CarryGod', avatar: '../../../../../assets/add_icon.png', points: 2150, mmr: 6200 },
        { nick: 'SupportKing', avatar: '../../../../../assets/add_icon.png', points: 2050, mmr: 6100 },
        { nick: 'OfflaneBeast', avatar: '../../../../../assets/add_icon.png', points: 1950, mmr: 6000 }
      ]
    },
    {
      name: 'Tier 2',
      players: [
        { nick: 'JungleLegend', avatar: '../../../../../assets/add_icon.png', points: 1850, mmr: 5800 },
        { nick: 'ThePuppey', avatar: '../../../../../assets/add_icon.png', points: 1750, mmr: 5700 },
        { nick: 'Miracle-', avatar: '../../../../../assets/add_icon.png', points: 1650, mmr: 5600 },
        { nick: 'Sumail', avatar: '../../../../../assets/add_icon.png', points: 1550, mmr: 5500 },
        { nick: 'RTZ', avatar: '../../../../../assets/add_icon.png', points: 1450, mmr: 5400 }
      ]
    },
    {
      name: 'Tier 3',
      players: [
        { nick: 'NoobSlayer', avatar: '../../../../../assets/add_icon.png', points: 1350, mmr: 5000 },
        { nick: 'GGWP', avatar: '../../../../../assets/add_icon.png', points: 1250, mmr: 4900 },
        { nick: 'FountainDiver', avatar: '../../../../../assets/add_icon.png', points: 1150, mmr: 4800 },
        { nick: 'Backdoorer', avatar: '../../../../../assets/add_icon.png', points: 1050, mmr: 4700 },
        { nick: 'RampageKing', avatar: '../../../../../assets/add_icon.png', points: 950, mmr: 4600 }
      ]
    },
    {
      name: 'Tier 4',
      players: [
        { nick: 'WardBitch', avatar: '../../../../../assets/add_icon.png', points: 850, mmr: 4000 },
        { nick: 'CourierSnatcher', avatar: '../../../../../assets/add_icon.png', points: 750, mmr: 3900 },
        { nick: 'SmokeGanker', avatar: '../../../../../assets/add_icon.png', points: 650, mmr: 3800 },
        { nick: 'DustCarrier', avatar: '../../../../../assets/add_icon.png', points: 550, mmr: 3700 },
        { nick: 'TangoSharer', avatar: '../../../../../assets/add_icon.png', points: 450, mmr: 3600 }
      ]
    },
    {
      name: 'Tier 5',
      players: [
        { nick: 'FeederPro', avatar: '../../../../../assets/add_icon.png', points: 350, mmr: 3000 },
        { nick: 'JungleCrystal', avatar: '../../../../../assets/add_icon.png', points: 250, mmr: 2900 },
        { nick: 'ShadowAmulet', avatar: '../../../../../assets/add_icon.png', points: 150, mmr: 2800 },
        { nick: 'FountainCamper', avatar: '../../../../../assets/add_icon.png', points: 100, mmr: 2700 },
        { nick: 'FirstBlood', avatar: '../../../../../assets/add_icon.png', points: 50, mmr: 2600 }
      ]
    }
  ];

  constructor(
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.selectedTier = this.tiers[0];
  }

  selectTier(tier: any) {
  this.selectedTier = tier;
}

  navigateToLogin(): void {
    // const dialogRef = this.dialog.open(AccessCodeDialogComponent, {
    //   width: '350px',
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     this.router.navigate(['/login']);
    //   }
    // });
    this.router.navigate(['/login']);
  }


  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}
