### 文件`/Users/james/Copy/Code/Menelaos/menelaos-test-project/src/Maze2/Maze2/MainController.c`的内容：
```c
#pragma once

#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <time.h>
#include "commandinterpreter.h"

int main(void) {
	system("chcp 65001");
	system("cls");
	srand(time(NULL));
	loop();
	return 0;
}
```
### 文件`/Users/james/Copy/Code/Menelaos/menelaos-test-project/src/Maze2/Maze2/commandinterpreter.c`的内容：
```c
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <ctype.h>
#include "commandinterpreter.h"
#include "maze.h"
#include "MazeModel.h"
#include "MazeView.h"
#include "walk_rules.h"

Maze *m = NULL;
char *s = NULL;

typedef struct {
	char *command;
	int(*eval)(char *s);
	char *help;
} cmd_dict;

cmd_dict commands[] = {
	{ "CLEAR",	cls,		"" },
	{ "CLS",	cls,		"Clears the screen." },
	{ "DUMP",	save,		"Save current maze data to a dump file." },
	{ "EXIT",	quit,		"Quits this software (command interpreter)." },
	{ "EXPORT",	exportm,		"Export maze run result." },
	{ "H",		help,		"" },
	{ "HELP",	help,		"Provides Help information for commands available." },
	{ "IMPORT",	import,		"Import a user-defined maze." },
	{ "LOAD",	load,		"Load a maze from a dump file." },
	{ "MAN",	help,		"" },
	{ "PRINT",	print,		"Print current maze." },
	{ "RANDOM",	random,		"Randomly generate a maze." },
	{ "RUN",	run,		"Solve the maze." },
	{ "QUIT",	quit,		"" },
	{ "UNAME",	version,	"" },
	{ "VER",	version,	"Displays the software version." },
	{ "VERSION",version,	"" },
};

static bool mute = false;

bool is_arg_present(char *arg) {
	if (arg == NULL) return false;
	while (*arg != 0 && isspace(*arg)) arg++;
	if (*arg == 0) return false;
	return true;
}

int help(char *arg) {
	for (int i = 0; i<sizeof commands / sizeof commands[0]; ++i) {
		if (strlen(commands[i].help)) printf("%s\t\t%s\n", commands[i].command, commands[i].help);
	}
	return EXIT_SUCCESS;
}

int version(char *arg) {
	puts("Maze2\n(c)2015 James Swineson. All rigits reserved.\nPowered by libJInterpreter.\n");
	return EXIT_SUCCESS;
}

int cls(char *arg) {
	system("@cls||clear");
	puts("");
	return EXIT_SUCCESS;
}

int quit(char *arg) {
	puts("Quitting...");
	return EXIT_FAILURE;
}

int random(char *arg) {
	if (m != NULL) Maze_free(m);
	unsigned width = 20, height = 20;
	float percent = 0.27;
	if (is_arg_present(arg)) {
		sscanf(arg, "%u%u%f", &width, &height, &percent);
	}
	m = MazeModel_random(width, height, percent);
	return EXIT_SUCCESS;
}

int print(char *arg) {
	showMaze(m);
	return EXIT_SUCCESS;
}

int run(char *arg) {
	Maze_clear(m);
	Point(*walk)(Maze *m, Point pos) = walk_right;
	if (is_arg_present(arg)) {
		if (!strcmp(arg, "left")) walk = walk_left;
		if (!strcmp(arg, "right")) walk = walk_right;
	}
	s = MazeModel_walkIterator(m, 200, walk, showMaze_ongoing, showMaze_succ, showMaze_failed);
	if (s != NULL) {
		printf("(%u, %u)", m->entrance.x, m->entrance.y);
		printf("%s\n", s);
	}
	return EXIT_SUCCESS;
}

int save(char *arg) {
	if (!is_arg_present(arg)) {
		fprintf(stderr, "Error: Filename not provided.\n");
		return EXIT_SUCCESS;
	}
	char filename[1024 + 1];
	if (sscanf(arg, "%1024s", filename) != 1) {
		fprintf(stderr, "Error: Invalid filename.\n");
		return EXIT_SUCCESS;
	}

	// strip '"' between file path
	while (*arg == '"') arg++;
	char *p = arg;
	while (*(p++) != 0) {
		if (*p == '"') {
			*p = 0;
			break;
		}
	}
	
	FILE *dest = fopen(arg, "w");
	if (dest == NULL) {
		fprintf(stderr, "Error: Failed to open file '%s'.\n", arg);
		return EXIT_SUCCESS;
	}
	else {
		fprintf(dest, "%u %u %u %u %u %u ", m->width, m->height, m->entrance.x, m->entrance.y, m->exit.x, m->exit.y);
		for (int i = 1; i <= m->width; i++) {
			for (int j = 1; j <= m->height; j++) {
				fprintf(dest, "%d ", Maze_get(m, i, j));
			}
		}
		
		fclose(dest);
		printf("Exported.\n");
		return EXIT_SUCCESS;
	}
	
	return EXIT_SUCCESS;
}

int load(char *arg) {
	if (!is_arg_present(arg)) {
		fprintf(stderr, "Error: Filename not provided.\n");
		return EXIT_SUCCESS;
	}
	char filename[1024 + 1];
	if (sscanf(arg, "%1024s", filename) != 1) {
		fprintf(stderr, "Error: Invalid filename.\n");
		return EXIT_SUCCESS;
	}
	
	// strip '"' between file path
	while (*arg == '"') arg++;
	char *p = arg;
	while (*(p++) != 0) {
		if (*p == '"') {
			*p = 0;
			break;
		}
	}

	FILE *src = fopen(arg, "r");
	if (src == NULL) {
		fprintf(stderr, "Error: Failed to open file '%s'.\n", arg);
		return EXIT_SUCCESS;
	}
	else {
		if (m != NULL) Maze_free(m);
		unsigned width;
		unsigned height;
		fscanf(src, "%u%u", &width, &height);
		m = Maze_malloc(width, height);
		fscanf(src, "%u%u%u%u", &(m->entrance.x), &(m->entrance.y), &(m->exit.x), &(m->exit.y));
		for (int i = 1; i <= m->width; i++) {
			for (int j = 1; j <= m->height; j++) {
				Maze_datatype d;
				fscanf(src, "%d", &d);
				Maze_set(m, i, j, (MazeModel_isWalked(d) && (d != MAZE_EXIT))?MAZE_EMPTY:d);
			}
		}

		fclose(src);
		printf("Imported.\n");
		return EXIT_SUCCESS;
	}
	
	return EXIT_SUCCESS;
}

int import(char *arg) {
	if (!is_arg_present(arg)) {
		fprintf(stderr, "Error: Filename not provided.\n");
		return EXIT_SUCCESS;
	}
	char filename[1024 + 1];
	if (sscanf(arg, "%1024s", filename) != 1) {
		fprintf(stderr, "Error: Invalid filename.\n");
		return EXIT_SUCCESS;
	}

	// strip '"' between file path
	while (*arg == '"') arg++;
	char *p = arg;
	while (*(p++) != 0) {
		if (*p == '"') {
			*p = 0;
			break;
		}
	}

	FILE *src = fopen(arg, "r");
	if (src == NULL) {
		fprintf(stderr, "Error: Failed to open file '%s'.\n", arg);
		return EXIT_SUCCESS;
	}
	else {
		if (m != NULL) Maze_free(m);
		unsigned width;
		unsigned height;
		fscanf(src, "%u%u", &width, &height);
		m = Maze_malloc(width, height);
		//fscanf(src, "%u%u%u%u", &(m->entrance.x), &(m->entrance.y), &(m->exit.x), &(m->exit.y));
		for (int i = 1; i <= m->height; i++) {
			for (int j = 1; j <= m->width; j++) {
				Maze_datatype d;
				fscanf(src, "%1d", &d);
				Maze_set(m, j, i, d ? MAZE_BLOCK : MAZE_EMPTY);
			}
		}

		// set wall
		for (unsigned i = 1; i <= height; i++) {
			Maze_set(m, 1, i, MAZE_WALL);
			Maze_set(m, width, i, MAZE_WALL);
		}
		for (unsigned i = 1; i <= width; i++) {
			Maze_set(m, i, 1, MAZE_WALL);
			Maze_set(m, i, height, MAZE_WALL);
		}

		// make exits
		Maze_set(m, 1, 3, MAZE_EXIT);
		Maze_set(m, 2, 3, MAZE_EMPTY);
		Maze_set(m, width, height - 2, MAZE_EXIT);
		Maze_set(m, width - 1, height - 2, MAZE_EMPTY);
		m->entrance.x = 1;
		m->entrance.y = 3;
		m->exit.x = width;
		m->exit.y = height - 2;

		fclose(src);
		printf("Imported.\n");
		return EXIT_SUCCESS;
	}

	return EXIT_SUCCESS;
}

int exportm(char *arg) {
	if (!is_arg_present(arg)) {
		fprintf(stderr, "Error: Filename not provided.\n");
		return EXIT_SUCCESS;
	}
	char filename[1024 + 1];
	if (sscanf(arg, "%1024s", filename) != 1) {
		fprintf(stderr, "Error: Invalid filename.\n");
		return EXIT_SUCCESS;
	}

	// strip '"' between file path
	while (*arg == '"') arg++;
	char *p = arg;
	while (*(p++) != 0) {
		if (*p == '"') {
			*p = 0;
			break;
		}
	}

	FILE *dest = fopen(arg, "w");
	if (dest == NULL) {
		fprintf(stderr, "Error: Failed to open file '%s'.\n", arg);
		return EXIT_SUCCESS;
	}
	else if (s != NULL) {
		fprintf(dest, "%u %u\n\n", m->width, m->height);
		fshowMaze(dest, m);
		fprintf(dest, "\n(%u, %u)", m->entrance.x, m->entrance.y);
		fprintf(dest, "%s\n", s);
		fclose(dest);
		printf("Exported.\n");
		return EXIT_SUCCESS;
	}
	else {
		puts("RUN first, please!");
		return EXIT_SUCCESS;
	}

	return EXIT_SUCCESS;
}

int runcommand(char *s)
{
	char temp[20];
	if (sscanf(s, "%20s", temp) != EOF) {
		temp[19] = 0;
		for (int i = 0; i < strlen(temp); ++i) temp[i] = toupper(temp[i]);
		for (int i = 0; i < sizeof commands / sizeof commands[0]; ++i) {
			if (strcmp(temp, commands[i].command) == 0) {
				char *t = s + strlen(commands[i].command);
				if (isspace(*t)) t++;
				if ( *t == 0 ) t = NULL;
				return (*(commands[i].eval))(t);
			}
		}
		sscanf(s, "%20s", temp);
		printf("'%s' is not recognized as an internal command.\n", temp);
	}
	return EXIT_SUCCESS;
}

int loop()
{
	random(NULL);
	char cmd[1024 + 1] = { 0 };
	do {
		printf("Maze2 >");
	} while (gets_s(cmd, 1024)!= NULL && !runcommand(cmd));
	return EXIT_SUCCESS;
}
```
### 文件`/Users/james/Copy/Code/Menelaos/menelaos-test-project/src/Maze2/Maze2/MazeModel.h`的内容：
```c
#pragma once
#ifndef __MAZEMODEL_H__
#define __MAZEMODEL_H__
#include <stdlib.h>
#include <Windows.h>
#include "maze.h"

#define MAX_STOP_COUNT 300
#define MAX_REVISIT_COUNT 50
#define MAX_STEPS 10000

Maze *MazeModel_random(unsigned width, unsigned height, float probability) {
	Maze *m = Maze_malloc(width, height);

	// generate a random block
	for (unsigned i = 2; i < width; i++)
		for (unsigned j = 2; j < height; j++)
			Maze_set(m, i, j, (rand() < (probability * RAND_MAX)) ? MAZE_BLOCK : MAZE_EMPTY);

	// set wall
	for (unsigned i = 1; i <= height; i++) {
		Maze_set(m, 1, i, MAZE_WALL);
		Maze_set(m, width, i, MAZE_WALL);
	}
	for (unsigned i = 1; i <= width; i++) {
		Maze_set(m, i, 1, MAZE_WALL);
		Maze_set(m, i, height, MAZE_WALL);
	}

	// make exits
	Maze_set(m, 1, 3, MAZE_EXIT);
	Maze_set(m, 2, 3, MAZE_EMPTY);
	Maze_set(m, width, height - 2, MAZE_EXIT);
	Maze_set(m, width - 1, height - 2, MAZE_EMPTY);
	m->entrance.x = 1;
	m->entrance.y = 3;
	m->exit.x = width;
	m->exit.y = height - 2;
	return m;
}

Maze *MazeModel_empty(unsigned width, unsigned height, float probability) {
	Maze *m = Maze_malloc(width, height);

	// generate a random block
	for (unsigned i = 2; i < width; i++)
		for (unsigned j = 2; j < height; j++)
			Maze_set(m, i, j, 0);

	// set wall
	for (unsigned i = 1; i <= height; i++) {
		Maze_set(m, 1, i, MAZE_WALL);
		Maze_set(m, width, i, MAZE_WALL);
	}
	for (unsigned i = 1; i <= width; i++) {
		Maze_set(m, i, 1, MAZE_WALL);
		Maze_set(m, i, height, MAZE_WALL);
	}

	// make exits
	Maze_set(m, 1, 3, MAZE_EXIT);
	Maze_set(m, 2, 3, MAZE_EMPTY);
	Maze_set(m, width, height - 2, MAZE_EXIT);
	Maze_set(m, width - 1, height - 2, MAZE_EMPTY);
	m->entrance.x = 1;
	m->entrance.y = 3;
	m->exit.x = width;
	m->exit.y = height - 2;
	return m;
}

bool MazeModel_isBlock(Maze_datatype d) {
	return (d == MAZE_WALL) || (d == MAZE_BLOCK);
}

bool MazeModel_isWalked(Maze_datatype d) {
	return (d == MAZE_WALKER) || (d == MAZE_WALKER_HEAD) || (d == MAZE_EXIT);// || (d == MAZE_SUCC) || d == (MAZE_FAIL);
}

char *MazeModel_walkIterator(Maze *m, DWORD sleep_time, Point(*walk)(Maze *m, Point pos), void(*redraw)(Maze *m, Point pos), void(*succ)(Maze *m, Point pos), void(*fail)(Maze *m, Point pos)) {
	walk(NULL, (Point) { 0, 0 }); // initialize static vars
	static char *s;
	if (s != NULL) free(s);
	s = malloc((m->width * m->height * 10 + 128) * sizeof(char));
	s[0] = 0;
	Point current_position = m->entrance;
	unsigned step_count = 0;
	unsigned stop_count = 0;
	unsigned revisited_count = 0;
	while (!Point_isEqual(current_position, m->exit)) {
		step_count++;
		Point new_position = walk(m, current_position);
		if (Point_isEqual(new_position, current_position) || MazeModel_isWalked(Maze_get(m, new_position.x, new_position.y))) {
			stop_count++; revisited_count++;
		}
		else stop_count = 0;
		if (step_count >= MAX_STEPS || stop_count >= MAX_STOP_COUNT || revisited_count >= MAX_REVISIT_COUNT || Point_isEqual((Point) { 0, 0 }, new_position)/*error*/) {
			fail(m, current_position);
			return NULL;
			return;
		}
		current_position = new_position;
		redraw(m, current_position);
		sprintf(s + strlen(s), "->(%u, %u)", current_position.x, current_position.y);
		printf("(%u, %u)", m->entrance.x, m->entrance.y);
		printf("%s\n", s);
		Sleep(sleep_time);
	}
	succ(m, current_position);
	return s;
}

int MazeModel_routeIterator(Maze *m, DWORD sleep_time, Point(*routeSearch)(Maze *m, Point pos), void(*redraw)(Maze *m, Point pos), void(*succ)(Maze *m, Point pos), void(*fail)(Maze *m, Point pos)) {
	routeSearch(NULL, (Point) { 0, 0 }); // initialize static vars

	Point current_position = m->entrance;
	unsigned step_count = 0;
	unsigned stop_count = 0;
	unsigned revisited_count = 0;
	while (!Point_isEqual(current_position, m->exit)) {
		step_count++;
		Point new_position = routeSearch(m, current_position);
		if (Point_isEqual(new_position, current_position) || MazeModel_isWalked(Maze_get(m, new_position.x, new_position.y))) {
			stop_count++; revisited_count++;
		}
		else stop_count = 0;
		if (step_count >= MAX_STEPS || stop_count >= MAX_STOP_COUNT || revisited_count >= MAX_REVISIT_COUNT || Point_isEqual((Point) { 0, 0 }, new_position)/*error*/) {
			fail(m, current_position);
			return EXIT_FAILURE;
			return;
		}
		current_position = new_position;
		redraw(m, current_position);
		Sleep(sleep_time);
	}
	succ(m, current_position);
	return EXIT_SUCCESS;
}
#endif
```
### 文件`/Users/james/Copy/Code/Menelaos/menelaos-test-project/src/Maze2/Maze2/MazeView.h`的内容：
```c
#pragma once
#ifndef __MAZEVIEW_H__
#define __MAZEVIEW_H__
#include <stdio.h>
#include "maze.h"

void showMaze(Maze *m) {
	system("cls");
	for (unsigned i = 1; i <= m->height; i++) {
		for (unsigned j = 1; j <= m->width; j++) {
			putc( Maze_get(m, j, i), stdout);  //219, 176-178, 32
		}
		putc('\n', stdout);
	}
}

void fshowMaze(FILE *f, Maze *m) {
	for (unsigned i = 1; i <= m->height; i++) {
		for (unsigned j = 1; j <= m->width; j++) {
			putc(MazeModel_isBlock(Maze_get(m, j, i)) ? '1' : '0', f);
		}
		putc('\n', f);
	}
}

void showMaze_ongoing(Maze *m, Point p) {
	Maze_set(m, p.x, p.y, Maze_get(m, p.x, p.y) == MAZE_WALKER ? MAZE_WALKER_HEAD : MAZE_WALKER);
	showMaze(m);
}

void showMaze_failed(Maze *m, Point p) {
	Maze_set(m, p.x, p.y, MAZE_FAIL);
	showMaze(m);
	puts("Failed.");
}

void showMaze_succ(Maze *m, Point p) {
	Maze_set(m, p.x, p.y, MAZE_SUCC);
	showMaze(m);
	puts("Successed.");
}

void showMazeRoute_failed(Maze *m, Point p) {
	printf("(%u, %u) ", p.x, p.y);
	//puts("Failed.");
}

void showMazeRoute_ongoing(Maze *m, Point p) {
	fprintf(stdout, "(%u, %u) ", p.x, p.y);
}

void showMazeRoute_succ(Maze *m, Point p) {
	printf("(%u, %u) ", p.x, p.y);
	//puts("Successed.");
}

#endif
```
### 文件`/Users/james/Copy/Code/Menelaos/menelaos-test-project/src/Maze2/Maze2/commandinterpreter.h`的内容：
```c
#pragma once
#ifndef __COMMANDINTERPRETER_H__
#define __COMMANDINTERPRETER_H__

#define COMMAND_MAX_LENGTH 512
#define FILENAME_MAX_LENGTH 1024
#define FILENAME_MAX_LENGTH_CHAR "1024"

int run_command(char *args);
int loop();
int help(char *arg);
int version(char *arg);
int cls(char *arg);
int quit(char *arg);
int save(char *arg);
int load(char *arg);

int random(char *arg);
int print(char *arg);
int run(char *arg);
int import(char *arg);
int exportm(char *arg);
#endif
```
### 文件`/Users/james/Copy/Code/Menelaos/menelaos-test-project/src/Maze2/Maze2/maze.h`的内容：
```c
#pragma once
#ifndef __MAZE_H__
#define __MAZE_H__
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

#define MAZE_WALL 219
#define MAZE_BLOCK 178
#define MAZE_EMPTY 32
#define MAZE_EXIT 249
#define MAZE_WALKER 1
#define MAZE_WALKER_HEAD 2
#define MAZE_SUCC 2
#define MAZE_FAIL 15
#define MAZE_ARROW_UP 24
#define MAZE_ARROW_DOWN 25
#define MAZE_ARROW_RIGHT 26
#define MAZE_ARROW_LEFT 27

typedef enum { DIRECTION_LEFT, DIRECTION_UP, DIRECTION_RIGHT, DIRECTION_DOWN } Direction;

Direction Direction_turnLeft(Direction d) {
	d -= 1;
	if (d < 0) d += 4;
	return d;
}

Direction Direction_turnRight(Direction d) {
	return (d + 1) % 4;
}

typedef int Maze_datatype;

typedef struct {
	unsigned x;
	unsigned y;
	//Direction d;
} Point;

typedef struct {
	unsigned width;
	unsigned height;
	Point entrance;
	Point exit;
	Maze_datatype *data;
} Maze;

unsigned __Maze_get_offset(Maze *m, unsigned width, unsigned height) {
	return (height - 1) * m->width + width - 1;
}

bool Point_isEqual(Point a, Point b) {
	return (a.x == b.x) && (a.y == b.y);
}

Maze *Maze_malloc(unsigned width, unsigned height) {
	Maze *m = (Maze*)malloc(sizeof(Maze));
	m->width = width;
	m->height = height;
	m->data = (Maze_datatype *)malloc(height * width * sizeof(Maze_datatype));
	return m;
}

void Maze_free(Maze *m) {
	free(m->data);
}

Maze_datatype Maze_get(Maze *m, unsigned width, unsigned height) {
	if (width > m->width || height > m->height || width < 1 || height < 1) { return MAZE_WALL; }
	return m->data[__Maze_get_offset(m, width, height)];
}

void Maze_set(Maze *m, unsigned width, unsigned height, Maze_datatype d) {
	if (width > m->width || height > m->height || width < 1 || height < 1) { return; }
	m->data[__Maze_get_offset(m, width, height)] = d;
}

Maze_datatype Maze_getNearBlock(Maze *m, Point p, Direction direction) {
	Maze_datatype d;
	switch (direction) {
	case DIRECTION_DOWN:
		d = Maze_get(m, p.x, p.y + 1); break;
	case DIRECTION_LEFT:
		d = Maze_get(m, p.x - 1, p.y); break;
	case DIRECTION_RIGHT:
		d = Maze_get(m, p.x + 1, p.y); break;
	case DIRECTION_UP:
		d = Maze_get(m, p.x, p.y - 1); break;
	}
	return d;
}

Point Point_moveTo(Point p, Direction direction) {
	switch (direction) {
	case DIRECTION_DOWN:
		p.y += 1; break;
	case DIRECTION_LEFT:
		p.x -= 1; break;
	case DIRECTION_RIGHT:
		p.x += 1; break;
	case DIRECTION_UP:
		p.y -= 1; break;
	}
	//p.d = direction;
	return p;
}

void Maze_clear(Maze *m) {
	for (unsigned i = 1; i <= m->height; i++) {
		for (unsigned j = 1; j <= m->width; j++) {
			Maze_datatype d = Maze_get(m, j, i);
			if ((d == MAZE_WALKER) || (d == MAZE_WALKER_HEAD)) {
				Maze_set(m, j, i, MAZE_EMPTY);
			}
		}
	}
}

#endif
```
### 文件`/Users/james/Copy/Code/Menelaos/menelaos-test-project/src/Maze2/Maze2/walk_rules.h`的内容：
```c
#pragma once
#ifndef __WALK_RULES_H__
#define __WALK_RULES_H__
#include "maze.h"
#include "MazeModel.h"
#include "MazeView.h"

#define MAX_ROUNDS 1

Point walk_left(Maze *m, Point pos) {
	static Direction last_direction = DIRECTION_RIGHT;
	static unsigned rounds = 0;
	if (m == NULL) { last_direction = DIRECTION_RIGHT; rounds = 0; return (Point) { 0, 0 }; }

	Maze_datatype t = Maze_getNearBlock(m, pos, Direction_turnLeft(last_direction));
	if (!MazeModel_isBlock(t)) {
		last_direction = Direction_turnLeft(last_direction);
	}
	else if (!MazeModel_isBlock(Maze_getNearBlock(m, pos, last_direction))) {
		// don't turn
	}
	else if (!MazeModel_isBlock(Maze_getNearBlock(m, pos, Direction_turnRight(last_direction)))) {
		last_direction = Direction_turnRight(last_direction);
	}
	else {
		// nowhere to go
		last_direction = Direction_turnRight(last_direction);
		last_direction = Direction_turnRight(last_direction);
		return pos;
	}
	return Point_moveTo(pos, last_direction);
}

Point walk_right(Maze *m, Point pos) {
	const Direction initial_direction = DIRECTION_RIGHT;
	static Direction last_direction;
	static int turns = 0;
	if (m == NULL) { last_direction = initial_direction; turns = 0; return (Point) {0, 0}; }
	Direction new_direction;
	if (!MazeModel_isBlock(Maze_getNearBlock(m, pos, Direction_turnRight(last_direction)))) {
		new_direction = Direction_turnRight(last_direction);
		turns--;
	}
	else if (!MazeModel_isBlock(Maze_getNearBlock(m, pos, last_direction))) {
		new_direction = last_direction;
		// don't turn
	}
	else if (!MazeModel_isBlock(Maze_getNearBlock(m, pos, Direction_turnLeft(last_direction)))) {
		// turn left
		new_direction = Direction_turnLeft(last_direction);
		turns++;
	}
	else {
		// turn back and stay
		new_direction = Direction_turnLeft(Direction_turnLeft(last_direction));
		turns += 2;
		//return pos;
	}
	Point new_pos = Point_moveTo(pos, new_direction);
	if (!MazeModel_isWalked(Maze_get(m, new_pos.x, new_pos.y))) turns = 0;
	if ((abs(turns) > MAX_ROUNDS * 4) || Point_isEqual(new_pos, m->entrance)) return (Point) { 0, 0 }; // died
	last_direction = new_direction;
	return new_pos;
}

#endif
```