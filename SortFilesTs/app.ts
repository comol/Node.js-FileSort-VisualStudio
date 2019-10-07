
import * as fs from 'fs';
import * as path  from 'path';
import { checkServerIdentity } from 'tls';

let srcpath: string = '';
let dstpath: string = '';
let needdelete: boolean = false;
let destdirs: Array<string> = []; 
let Args: Array<string> = process.argv.slice( 2 );

//Копирует файл в правильный каталог по заданным правилам
function copyfile( src: string, needdelete: boolean ): void
{
	let filestring: string = src;
	let firstletter: string = getshortfilename( filestring ).substr( 0, 1 );
	let srcfile: string = src;
	let dstfile: string = path.join( dstpath, firstletter, getshortfilename( src ) );

	if ( destdirs.indexOf( firstletter ) == -1 )
	{
		let dirpath: string = path.join( dstpath, firstletter );
		destdirs.push( firstletter );

		fs.exists( dirpath, ( exists: boolean ) =>
		{
			if ( !exists )
			{
				fs.mkdir( dirpath, ( err ) =>
				{
					if ( err )
					{
						console.log( `${dirpath} ' not created' ` );
					}
					else
					{
						syscopyfile( srcfile, dstfile, needdelete );
					}
				}
				);
			}
			else
			{
				syscopyfile( srcfile, dstfile, needdelete );
			}

		} );
		
	}	
}

function syscopyfile( srcfile: string, dstfile: string, move: boolean ): void
{

	fs.exists( dstfile, ( exists: boolean ) =>
	{
		if ( !exists )
		{
			fs.copyFile( srcfile, dstfile, ( err ) =>
			{
				if ( err )
				{
					console.log( `${dstfile} ' not created' ` );
				}
				else
				{
					if ( move )
					{
						fs.unlink( srcfile, ( err ) =>
						{
							if ( err )
							{
								console.log( `${srcfile} ' not deleted' ` );
							}
						} );
					}
				}
			} );
		}
	} );


}

// Копирует и удаляет файлы в нужную папку
// рекурсивная функция
function ReadAllFiles( dir: string, needdelete: boolean, callback: () => void ): void
{
	fs.readdir( dir, ( err, readfiles ) =>
	{
		for ( var i in readfiles )
		{
			let name: string = path.join( dir, readfiles[i] );
			fs.stat( name, function ( err, filestats )
			{
				if ( filestats.isDirectory() )
				{
					ReadAllFiles( name, needdelete, () =>
					{
						fs.rmdir( name, ( err ) =>
						{
							if ( err )
							{
								console.log( `${name} ' not created' ` );
							}
						} );
					} );
				}
				else 
				{
					copyfile( name, needdelete );

				}
			} );	
		}
	});
}

// получает короткое имя файлов по полному
function getshortfilename( filename: string ): string
{
	let filearray = filename.split( '\\' );
	let shortfilename: string = filearray[filearray.length - 1];
	return shortfilename;
}

// Основной раздел
if ( Args.length < 2 )
{
	console.log( 'Usage: app.ts <source path> <destination path> [-delete]' );
	process.exit( 0 );
}

if ( Args.length == 3 )
{
	if ( Args[2] == '-delete' )
	{
		needdelete = true;
	}
}

srcpath = Args[0];
dstpath = Args[1];

ReadAllFiles( srcpath, needdelete, () => { } );
