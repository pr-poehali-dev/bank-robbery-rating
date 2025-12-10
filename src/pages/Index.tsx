import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface TeamData {
  name: string;
  totalScore: number;
  rounds: RoundResult[];
}

interface RoundResult {
  roundNumber: number;
  time: number;
  isCorrect: boolean;
  place: number;
  points: number;
}

const INITIAL_TEAMS: TeamData[] = [
  { name: 'Команда Альфа', totalScore: 0, rounds: [] },
  { name: 'Команда Бета', totalScore: 0, rounds: [] },
  { name: 'Команда Гамма', totalScore: 0, rounds: [] },
];

const ROUND_COEFFICIENTS = [1, 1, 2, 2, 3];
const PLACE_POINTS = [100, 75, 50];

const Index = () => {
  const [teams, setTeams] = useState<TeamData[]>(INITIAL_TEAMS);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundData, setRoundData] = useState<{ time: string; isCorrect: boolean }[]>([
    { time: '', isCorrect: true },
    { time: '', isCorrect: true },
    { time: '', isCorrect: true },
  ]);

  const calculateRoundResults = () => {
    const validTeams = roundData
      .map((data, idx) => ({
        teamIdx: idx,
        time: parseFloat(data.time) || 999,
        isCorrect: data.isCorrect,
      }))
      .filter((t) => t.time < 999);

    const sortedByTime = [...validTeams].sort((a, b) => a.time - b.time);
    const coefficient = ROUND_COEFFICIENTS[currentRound - 1];

    const results = validTeams.map((team) => {
      const placeIndex = sortedByTime.findIndex((t) => t.teamIdx === team.teamIdx);
      const placePoints = PLACE_POINTS[placeIndex] || 0;
      const correctMultiplier = team.isCorrect ? 1 : 0;
      const points = correctMultiplier * coefficient * placePoints;

      return {
        teamIdx: team.teamIdx,
        roundNumber: currentRound,
        time: team.time,
        isCorrect: team.isCorrect,
        place: placeIndex + 1,
        points,
      };
    });

    const updatedTeams = teams.map((team, idx) => {
      const result = results.find((r) => r.teamIdx === idx);
      if (result) {
        return {
          ...team,
          rounds: [...team.rounds, result],
          totalScore: team.totalScore + result.points,
        };
      }
      return team;
    });

    setTeams(updatedTeams);
    setCurrentRound(currentRound + 1);
    setRoundData([
      { time: '', isCorrect: true },
      { time: '', isCorrect: true },
      { time: '', isCorrect: true },
    ]);
  };

  const editTeamName = (idx: number, newName: string) => {
    const updatedTeams = [...teams];
    updatedTeams[idx].name = newName;
    setTeams(updatedTeams);
  };

  const resetGame = () => {
    setTeams(INITIAL_TEAMS);
    setCurrentRound(1);
    setRoundData([
      { time: '', isCorrect: true },
      { time: '', isCorrect: true },
      { time: '', isCorrect: true },
    ]);
  };

  const sortedTeams = [...teams].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center space-y-4 py-8">
          <h1 className="text-5xl md:text-7xl font-black font-orbitron neon-text tracking-wider uppercase animate-pulse-glow">
            <Icon name="Vault" className="inline-block mr-4" size={60} />
            Ограбление Банка Гипотез
          </h1>
          <p className="text-lg md:text-xl text-secondary neon-cyan font-mono">
            {'>'} СИСТЕМА РЕЙТИНГА АКТИВИРОВАНА_
          </p>
        </header>

        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card border border-primary/30">
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Icon name="Trophy" size={18} className="mr-2" />
              Рейтинг
            </TabsTrigger>
            <TabsTrigger value="rounds" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Icon name="Target" size={18} className="mr-2" />
              Раунды
            </TabsTrigger>
            <TabsTrigger value="rules" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Icon name="BookOpen" size={18} className="mr-2" />
              Правила
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Icon name="History" size={18} className="mr-2" />
              История
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-4 mt-6">
            <Card className="border-primary/30 bg-card/50 backdrop-blur neon-border">
              <CardHeader>
                <CardTitle className="font-orbitron text-3xl flex items-center gap-3">
                  <Icon name="Crown" className="text-accent animate-flicker" size={32} />
                  Таблица лидеров
                </CardTitle>
                <CardDescription className="text-muted-foreground font-mono">
                  Топ команд по количеству баллов
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sortedTeams.map((team, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-4 rounded border transition-all hover:scale-[1.02] ${
                      idx === 0
                        ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
                        : 'border-primary/20 bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={idx === 0 ? 'destructive' : 'outline'}
                        className={`text-xl font-bold w-12 h-12 flex items-center justify-center ${
                          idx === 0 ? 'bg-accent animate-pulse-glow' : ''
                        }`}
                      >
                        {idx + 1}
                      </Badge>
                      <div>
                        <Input
                          value={team.name}
                          onChange={(e) => editTeamName(teams.indexOf(team), e.target.value)}
                          className="font-orbitron text-lg font-semibold bg-transparent border-none focus:border-primary p-0 h-auto"
                        />
                        <p className="text-sm text-muted-foreground font-mono">
                          Раундов пройдено: {team.rounds.length}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black font-mono neon-text">{team.totalScore}</p>
                      <p className="text-sm text-muted-foreground">баллов</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rounds" className="space-y-4 mt-6">
            <Card className="border-primary/30 bg-card/50 backdrop-blur neon-border">
              <CardHeader>
                <CardTitle className="font-orbitron text-3xl flex items-center gap-3">
                  <Icon name="Activity" className="text-secondary animate-pulse" size={32} />
                  Раунд {currentRound} / 5
                </CardTitle>
                <CardDescription className="text-muted-foreground font-mono">
                  Коэффициент: x{ROUND_COEFFICIENTS[currentRound - 1] || 1}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {teams.map((team, idx) => (
                  <div key={idx} className="space-y-3 p-4 border border-primary/20 rounded bg-muted/20">
                    <h3 className="font-orbitron text-xl text-primary">{team.name}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`time-${idx}`} className="font-mono">
                          Время (секунды)
                        </Label>
                        <Input
                          id={`time-${idx}`}
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          value={roundData[idx].time}
                          onChange={(e) => {
                            const newData = [...roundData];
                            newData[idx].time = e.target.value;
                            setRoundData(newData);
                          }}
                          className="bg-input border-primary/30 font-mono text-lg"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant={roundData[idx].isCorrect ? 'default' : 'destructive'}
                          onClick={() => {
                            const newData = [...roundData];
                            newData[idx].isCorrect = !newData[idx].isCorrect;
                            setRoundData(newData);
                          }}
                          className="w-full font-mono"
                        >
                          <Icon
                            name={roundData[idx].isCorrect ? 'CheckCircle' : 'XCircle'}
                            size={18}
                            className="mr-2"
                          />
                          {roundData[idx].isCorrect ? 'Правильно' : 'Неправильно'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex gap-4">
                  <Button
                    onClick={calculateRoundResults}
                    disabled={currentRound > 5 || roundData.every((d) => !d.time)}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-orbitron text-lg py-6 neon-border"
                  >
                    <Icon name="Play" size={20} className="mr-2" />
                    Завершить раунд
                  </Button>
                  <Button
                    onClick={resetGame}
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent/10 font-mono"
                  >
                    <Icon name="RotateCcw" size={20} className="mr-2" />
                    Сброс
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="mt-6">
            <Card className="border-primary/30 bg-card/50 backdrop-blur neon-border">
              <CardHeader>
                <CardTitle className="font-orbitron text-3xl flex items-center gap-3">
                  <Icon name="ScrollText" className="text-secondary" size={32} />
                  Правила начисления баллов
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/30 p-6 rounded border border-primary/20">
                  <h3 className="font-orbitron text-xl text-primary mb-4">Формула расчёта:</h3>
                  <code className="block text-lg font-mono bg-background p-4 rounded border border-primary/30 neon-text">
                    Баллы = Правильность × Коэффициент раунда × Баллы за место
                  </code>
                </div>

                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="correct" className="border border-primary/20 rounded px-4">
                    <AccordionTrigger className="font-orbitron hover:text-primary">
                      <Icon name="CheckCircle2" size={20} className="mr-2 text-primary" />
                      Правильность ответа
                    </AccordionTrigger>
                    <AccordionContent className="font-mono text-muted-foreground">
                      <p>✓ Правильно = 1</p>
                      <p>✗ Неправильно = 0</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="coefficient" className="border border-primary/20 rounded px-4">
                    <AccordionTrigger className="font-orbitron hover:text-primary">
                      <Icon name="TrendingUp" size={20} className="mr-2 text-secondary" />
                      Коэффициент раунда
                    </AccordionTrigger>
                    <AccordionContent className="font-mono text-muted-foreground space-y-1">
                      <p>Раунды 1-2: x1</p>
                      <p>Раунды 3-4: x2</p>
                      <p>Раунд 5: x3</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="place" className="border border-primary/20 rounded px-4">
                    <AccordionTrigger className="font-orbitron hover:text-primary">
                      <Icon name="Medal" size={20} className="mr-2 text-accent" />
                      Баллы за место (по скорости)
                    </AccordionTrigger>
                    <AccordionContent className="font-mono text-muted-foreground space-y-1">
                      <p>🥇 1 место: 100 баллов</p>
                      <p>🥈 2 место: 75 баллов</p>
                      <p>🥉 3 место: 50 баллов</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="bg-accent/10 border border-accent/30 p-4 rounded">
                  <h4 className="font-orbitron text-accent mb-2 flex items-center gap-2">
                    <Icon name="Lightbulb" size={20} />
                    Пример расчёта:
                  </h4>
                  <p className="font-mono text-sm text-muted-foreground">
                    Команда ответила правильно (1) в раунде 3 (×2) и заняла 1 место (100 баллов)
                    <br />
                    Результат: 1 × 2 × 100 = <span className="text-primary font-bold">200 баллов</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="grid gap-4">
              {teams.map((team, teamIdx) => (
                <Card key={teamIdx} className="border-primary/30 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="font-orbitron text-2xl text-primary flex items-center gap-3">
                      <Icon name="Users" size={24} />
                      {team.name}
                    </CardTitle>
                    <CardDescription className="font-mono text-lg">
                      Всего баллов: <span className="text-primary font-bold">{team.totalScore}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {team.rounds.length === 0 ? (
                      <p className="text-muted-foreground font-mono text-center py-8">
                        Пока нет завершённых раундов
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {team.rounds.map((round, roundIdx) => (
                          <div
                            key={roundIdx}
                            className="flex items-center justify-between p-3 bg-muted/20 rounded border border-primary/20 hover:border-primary/40 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <Badge variant="outline" className="font-mono">
                                Раунд {round.roundNumber}
                              </Badge>
                              <span className="font-mono text-sm text-muted-foreground">
                                {round.time.toFixed(1)}с
                              </span>
                              <Badge
                                variant={round.isCorrect ? 'default' : 'destructive'}
                                className="font-mono"
                              >
                                <Icon
                                  name={round.isCorrect ? 'Check' : 'X'}
                                  size={14}
                                  className="mr-1"
                                />
                                {round.isCorrect ? 'Верно' : 'Ошибка'}
                              </Badge>
                              <Badge variant="secondary" className="font-mono">
                                {round.place} место
                              </Badge>
                            </div>
                            <span className="text-2xl font-bold font-mono neon-text">
                              +{round.points}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
