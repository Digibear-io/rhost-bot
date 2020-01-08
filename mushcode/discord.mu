/*
-------------------------------------------------------------------------------
----- FN.WHO ------------------------------------------------------------------
    Get all of the visible members of the who list for the discord bot.
    You'll want to make sure your API object isn't immortal, or the whole of
    discord will be able to see your immortals and wizards whilst idle cloaked.
-------------------------------------------------------------------------------
*/

&fn.who #76=
    ifelse(
        words(who()),
        iter(
            who(),
            if(
                visible(##),
                %r[ljust([name(##)][if(orflags(##,iW),%b%(Staff%))],29)]
                [rjust([timefmt($!2cd $02X:$02F,conn(##))],10)]
                [rjust(singletime(idle(##)),5)]
            )
        ), %rNo one's connected. %(Bummer!%)
    )

&fn.chat #76=^[Discord] *:think [execscript(discord.js, %0)]
